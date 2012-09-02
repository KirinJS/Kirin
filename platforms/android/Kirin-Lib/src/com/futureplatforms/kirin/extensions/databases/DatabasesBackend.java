/*
   Copyright 2011 Future Platforms

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/


package com.futureplatforms.kirin.extensions.databases;

import static com.futureplatforms.kirin.internal.JSONUtils.stringOrNull;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executor;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.content.SharedPreferences;
import android.database.AbstractWindowedCursor;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteDatabase.CursorFactory;
import android.database.sqlite.SQLiteOpenHelper;
import android.os.Build;
import android.util.Log;

import com.futureplatforms.kirin.C;
import com.futureplatforms.kirin.extensions.IKirinExtensionOnNonDefaultThread;
import com.futureplatforms.kirin.extensions.KirinExtensionAdapter;
import com.futureplatforms.kirin.extensions.databases.DBStatement.StatementType;
import com.futureplatforms.kirin.helpers.IKirinExtensionHelper;
import com.futureplatforms.kirin.internal.attic.IOUtils;
import com.futureplatforms.kirin.internal.fragmentation.CursorCoercer;
import com.futureplatforms.kirin.internal.fragmentation.CursorCoercer4;
import com.futureplatforms.kirin.internal.fragmentation.CursorCoercer5;
import com.futureplatforms.kirin.state.IKirinDropbox;

public class DatabasesBackend extends KirinExtensionAdapter implements IDatabasesBackend, IKirinExtensionOnNonDefaultThread {

    private final SharedPreferences mPrefs;

    private final Map<String, SQLiteDatabase> mDatabases = new HashMap<String, SQLiteDatabase>();
    private final Context mContext;

    private final Map<String, DBTransaction> mInFlightTransactions = new HashMap<String, DBTransaction>();
    private ExecutorService mWritingExecutor;
    private ExecutorService mReadOnlyExecutor;
    
    private final CursorCoercer mCursorCoercer;

    private class OpenHelper extends SQLiteOpenHelper {

        public OpenHelper(Context context, String name, CursorFactory factory, int version) {
            super(context, name, factory, version);
        }

        @Override
        public void onCreate(SQLiteDatabase db) {
            Log.i(C.TAG, "Creating database");
        }

        @Override
        public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
            Log.i(C.TAG, "Updating database");
        }

    }

    
    public DatabasesBackend(Context context) {
    	this(context, null, null, Executors.newCachedThreadPool(), Executors.newFixedThreadPool(1));
    }
    
    public DatabasesBackend(Context context, SharedPreferences preferences, IKirinExtensionHelper js, ExecutorService readExecutor, ExecutorService writeExecutor) {
        super(context, "Databases", js);
        
        mContext = context;
        mWritingExecutor = writeExecutor;
        mReadOnlyExecutor = readExecutor;
        
        if (Build.VERSION.SDK_INT >= 5) {
            mCursorCoercer = new CursorCoercer5();
        } else {
            mCursorCoercer = new CursorCoercer4();
        }
        
        if (preferences == null) {
        	preferences = mContext.getSharedPreferences("kirin-databases", 0);
        }
        mPrefs = preferences;
    }

    public SQLiteDatabase getDatabase(String dbName) {
        return mDatabases.get(dbName);
    }

    public DBTransaction getTransaction(String txId) {
        return mInFlightTransactions.get(txId);
    }

    public void closeAll() {
        for (Map.Entry<String, SQLiteDatabase> entry : mDatabases.entrySet()) {
            SQLiteDatabase db = entry.getValue();
            if (db.isOpen()) {
                db.close();
            }
        }

        // Should we really do this?
        mInFlightTransactions.clear();

        mDatabases.clear();

    }

    @Override
    public void beginTransaction_(JSONObject config) {
        String txId = config.optString("txId");

        DBTransaction tx = mInFlightTransactions.get(txId);

        if (tx != null) {
            return;
        }

        String onSuccess = stringOrNull(config, "onSuccessToken", null);
        String onError = stringOrNull(config, "onErrorToken", null);
        boolean readOnly = config.optBoolean("readOnly");
        String dbName = config.optString("dbName");

        tx = new DBTransaction(dbName, txId, onSuccess, onError, readOnly);
        mInFlightTransactions.put(txId, tx);

    }

    @Override
    public void db_openOrCreate_(String dbName, JSONObject config) {
        String txId = config.optString("txId");
        String onCreate = stringOrNull(config, "onCreateToken", null);
        String onUpdate = stringOrNull(config, "onUpdateToken", null);
        String onOpened = stringOrNull(config, "onOpenedToken", null);
        String onError = stringOrNull(config, "onErrorToken", null);
        String filename = config.optString("filename");
        int requestedVersion = config.optInt("version");

        SQLiteDatabase db = mDatabases.get(dbName);
        if (db == null || !db.isOpen()) {
            CursorFactory factory = null;
            OpenHelper helper = new OpenHelper(mContext, filename, factory, 1);
            db = helper.getWritableDatabase();
            mDatabases.put(dbName, db);
        }

        int existingVersion = getDatabaseVersion(dbName);
        if (existingVersion != requestedVersion) {
            DBTransaction tx = mInFlightTransactions.get(txId);
            assert tx == null;
            tx = new DBTransaction(dbName, txId, onOpened, onError, false, requestedVersion);
            mInFlightTransactions.put(txId, tx);
            if (existingVersion == -1) {
                // we need to call onCreate
                mKirinHelper.jsCallback(onCreate);
            } else {
                // we need to call onUpdate
                mKirinHelper.jsCallback(onUpdate, existingVersion, requestedVersion);
            }
            mKirinHelper.cleanupCallback(onCreate, onUpdate);

        } else {
            mKirinHelper.jsCallback(onOpened);
            mKirinHelper.cleanupCallback(onOpened, onError, onUpdate, onCreate);
        }
    }

    private void setDatabaseVersion(String dbName, int schemaVersion) {
		mPrefs.edit().putInt("db_revision_" + dbName, schemaVersion).commit();
	}
    
	private int getDatabaseVersion(String dbName) {
		return mPrefs.getInt("db_revision_" + dbName, -1);
	}

    @Override
    public void diposeToken_(String token) {
        Object obj = mKirinHelper.getDropbox().consume(token);
        if (obj instanceof Cursor) {
            ((Cursor) obj).close();
        }
    }

    protected void cleanupTx(DBTransaction tx) {

        List<DBStatement> statements = tx.getEntries();

        Set<String> callbacks = new HashSet<String>();
        for (DBStatement s : statements) {
            if (s.mOnSuccess != null) {
                callbacks.add(s.mOnSuccess);
            }
            if (s.mOnError != null) {
                callbacks.add(s.mOnError);
            }
        }

        mKirinHelper.cleanupCallback(tx.mOnSuccess, tx.mOnError);
        mKirinHelper.cleanupCallback(callbacks.toArray(new String[callbacks.size()]));
    }

    @Override
    public void endTransaction_(String txId) {
        final DBTransaction tx = mInFlightTransactions.remove(txId);
        if (tx == null) {
            Log.w(C.TAG, "Transaction {0} not valid");
            cleanupTx(tx);
            return;
        }

        Runnable job = new Runnable() {
            public void run() {

                String dbName = tx.mDbName;
				SQLiteDatabase db = mDatabases.get(dbName);
                String onError = null;

                try {
                    beginNativeTransaction(db);
                    for (DBStatement s : tx.getEntries()) {
                        onError = s.mOnError;

                        // TODO do something for type=file.
                        s.mResult = execStatement(db, s);

                    }
                    setNativeTransactionSuccessful(db);
                } catch (SQLException e) {
                    mKirinHelper.jsCallback(onError, e.getLocalizedMessage());
                    mKirinHelper.jsCallback(tx.mOnError, e.getLocalizedMessage());
                    cleanupTx(tx);
                    return;
                } finally {
                    endNativeTransaction(db);
                }

                IKirinDropbox dropbox = mKirinHelper.getDropbox();
                for (DBStatement s : tx.getEntries()) {
                    String onSuccess = s.mOnSuccess;
                    Cursor cursor = s.mResult;
                    if (cursor == null || onSuccess == null) {
                        continue;
                    }

                    boolean emptyResults = !cursor.moveToFirst();

                    switch (s.mType) {
                    case rowset:
                        mKirinHelper.jsCallback(onSuccess, dropbox.put("db.rowset.", cursor));
                        break;
                    case file:
                        mKirinHelper.jsCallback(onSuccess);
                        break;
                    case row:
                        if (emptyResults) {
                            mKirinHelper.jsCallback(onSuccess, new JSONObject());
                        } else {
                            mKirinHelper.jsCallback(onSuccess, coerceToJSONObject(columnNames(cursor), cursor));
                        }
                        break;
                    case array:
                        if (emptyResults) {
                            mKirinHelper.jsCallback(onSuccess, new JSONArray());
                        } else {
                            mKirinHelper.jsCallback(onSuccess, coerceToJSONArray(columnNames(cursor), cursor));
                        }
					case eof:
						break;
					default:
						break;
                    }

                    if (s.mType != StatementType.rowset) {
                        cursor.close();
                    }
                }

                int schemaVersion = tx.mSchemaVersion;
				if (schemaVersion >= 0) {
                    // update the schema version if it needs it.
                    setDatabaseVersion(dbName, schemaVersion);
                }

                mKirinHelper.jsCallback(tx.mOnSuccess);
                cleanupTx(tx);
            }
        };
        
        executeEndTransaction(tx, job);
    }

    protected void executeEndTransaction(DBTransaction tx, Runnable job) {
        Executor executor = tx.mReadOnly ? mReadOnlyExecutor : mWritingExecutor;
        if (executor != null) {
            executor.execute(job);
        } else {
            job.run();
        }
        
    }

    private String[] columnNames(Cursor cursor) {
        String[] cols = cursor.getColumnNames();

        for (int i = 0, count = cols.length; i < count; i++) {
            String columnName = cols[i];
            
            int dot = columnName.indexOf('.');
            if (dot >= 0) {
                // assume that the column name will never end in dot.
                columnName = columnName.substring(dot + 1);
            }
            cols[i] = columnName;
            
        }
        return cols;
    }

    public JSONArray coerceToJSONArray(String[] columnNames, Cursor cursor) {
        JSONArray array = new JSONArray();

        while (!cursor.isAfterLast()) {
            JSONObject obj = coerceToJSONObject(columnNames, cursor);

            array.put(obj);

            cursor.moveToNext();
        }
        return array;
    }

    public JSONObject coerceToJSONObject(String[] cols, Cursor cursor) {
        if (cursor instanceof AbstractWindowedCursor) {
            return mCursorCoercer.coerceToJSONObject(cols, (AbstractWindowedCursor) cursor);
        } else {
            JSONObject obj = new JSONObject();
            for (int i = 0; i < cols.length; i++) {
                try {
                    if (!cursor.isNull(i)) {
                        obj.put(cols[i], cursor.getString(i));
                    }
                } catch (JSONException e) {
                    Log.e(C.TAG, e.getLocalizedMessage(), e);
                }

            }
            return obj;
        }

    }

    public void appendToScript(String txId, JSONArray log) {
        DBTransaction tx = mInFlightTransactions.get(txId);

        tx.appendTo(log);

    }

    @Override
    public void tx_appendToOpenerScript_(String txId, JSONArray log) {
        appendToScript(txId, log);
    }

    @Override
    public void tx_appendToTransactionScript_(String txId, JSONArray log) {
        appendToScript(txId, log);
    }

    protected Cursor execStatement(SQLiteDatabase db, DBStatement s) {
        if (s.mType == StatementType.file) {
        	// TODO make this work a KirinFileSystem.
            String filename = "generated-javascript" + s.mSql; //;mJS.getPathToJavascriptDir() + s.mSql;

            try {
                String block = IOUtils.loadTextAsset(mContext, filename);
                String[] lines = block.split("\\s*;\\s*");
                Object[] args = new Object[0];
                for (String line : lines) {
                    execSQL(db, line, args);
                }
                return null;
            } catch (IOException e) {
                Log.e(C.TAG, "Problem loading assets file: " + filename, e);
                throw new SQLException();
            }
        } else if (s.mOnSuccess == null) {
            execSQL(db, s.mSql, s.mParams);
            return null;
        } else {
            return rawQuery(db, s.mSql, s.mParams);
        }
    }

    /* *********************************************************************
     * The methods that use a native database. We've wrapped them up here so we
     * can test them.
     * ********************************************************************
     */

    protected void execSQL(SQLiteDatabase db, String sql, Object[] params) {
        db.execSQL(sql, params);
    }

    protected Cursor rawQuery(SQLiteDatabase db, String sql, String[] params) {
        return db.rawQuery(sql, params);
    }

    protected void beginNativeTransaction(SQLiteDatabase db) {
        db.beginTransaction();
    }

    protected void setNativeTransactionSuccessful(SQLiteDatabase db) {
        db.setTransactionSuccessful();
    }

    protected void endNativeTransaction(SQLiteDatabase db) {
        db.endTransaction();
    }

    @Override
    public void onLoad() {
        // NOP
    }

	@Override
	public Executor getExecutor() {
		return Executors.newFixedThreadPool(1);
	}


}
