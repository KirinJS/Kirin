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


package com.futureplatforms.kirin.test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.SharedPreferences;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.preference.PreferenceManager;
import android.test.AndroidTestCase;
import android.util.Log;

import com.futureplatforms.kirin.C;
import com.futureplatforms.kirin.extensions.databases.DBStatement;
import com.futureplatforms.kirin.extensions.databases.DBStatement.StatementType;
import com.futureplatforms.kirin.extensions.databases.DBTransaction;
import com.futureplatforms.kirin.extensions.databases.DatabasesBackend;
import com.futureplatforms.kirin.test.dummies.DummyJavascript;


public class DatabasesBackendTest_inactive extends AndroidTestCase {

    private DatabasesBackend mBackend;

    private DummyJavascript mJS;

    private JSONObject mOpeningConfig;

    private SharedPreferences mPrefs;

    private JSONObject mTransactionConfig;

    private String txId;

    private int mTxCounter = 0;

    private MatrixCursor mCursor;

    private Object[][] mResults;

    private List<String> mExecutedSQL;

    private int mOpenTransactions = 0;
    
    protected void setUp() throws Exception {

        mOpeningConfig = new JSONObject();

        mOpeningConfig.put("filename", ":memory:");
        mOpeningConfig.put("version", 1);
        txId = "tx." + mTxCounter;
        mTxCounter++;
        mOpeningConfig.put("txId", txId);
        mOpeningConfig.put("onCreateToken", "onCreate");
        mOpeningConfig.put("onUpdateToken", "onUpdate");
        mOpeningConfig.put("onOpenedToken", "onOpened");
        mOpeningConfig.put("onErrorToken", "onError");

        /*
         * backend.beginTransaction_({ dbName: (string) databaseName, txId:
         * (string) transactionId, onSuccessToken: (string)
         * transaction_onSuccess_token, onErrorToken: (string)
         * transaction_onError_token, readOnly: (bool) readOnly });
         */
        mTransactionConfig = new JSONObject();
        mTransactionConfig.put("dbName", "testDatabase");
        mTransactionConfig.put("txId", txId);

        mResults = new Object[][] { new Object[] { 1, 2, 3 }, new Object[] { 4, 5, 6 } };

        mJS = new DummyJavascript();
        mPrefs = PreferenceManager.getDefaultSharedPreferences(getContext());
        mExecutedSQL = new ArrayList<String>();
        mOpenTransactions = 0;
        mBackend = new DatabasesBackend(getContext(), mPrefs, mJS, null, null) {
            
            
            
            @Override
            protected void beginNativeTransaction(SQLiteDatabase db) {
                mOpenTransactions ++;
            }

            @Override
            protected void endNativeTransaction(SQLiteDatabase db) {
                mOpenTransactions --;
            }
            
            @Override
            protected void setNativeTransactionSuccessful(SQLiteDatabase db) {
                // NOP.
            }
            
            
            @Override
            protected Cursor rawQuery(SQLiteDatabase db, String sql, String[] params) {
                mExecutedSQL.add(sql);
                if (sql.contains("ERROR")) {
                    throw new SQLException();
                }

                mCursor = new MatrixCursor(new String[] { "foo", "bar", "baz" });
                for (Object[] row : mResults) {
                    mCursor.addRow(row);
                }
                return mCursor;
            }

            @Override
            protected void execSQL(SQLiteDatabase db, String sql, Object[] params) {
                mExecutedSQL.add(sql);
                if (sql.contains("ERROR")) {
                    throw new SQLException();
                }
            }
        };
    }

    protected void tearDown() throws Exception {
        assertEquals(0, mOpenTransactions);
        mOpenTransactions = 0;
        mJS.clear();
        mBackend.closeAll();
    }

    public void testOpening_NoCreateOrUpdate_HappyCase() throws Exception {
        int revision = 1;
        String dbName = "testDatabase";
        mOpeningConfig.put("version", revision);
        mPrefs.edit().putInt("db_revision_" + dbName, revision).commit();

        mBackend.db_openOrCreate_(dbName, mOpeningConfig);

        mJS.verifyCalledCallbacks("onOpened");
        mJS.verifyDeletedCallbacks("onOpened", "onError", "onUpdate", "onCreate");

        assertNotNull(mBackend.getDatabase(dbName));
        assertTrue(mBackend.getDatabase(dbName).isOpen());
        assertNull(mBackend.getTransaction(txId));
    }

    public static JSONArray newJSONArray(Object... elements) {
        JSONArray array = new JSONArray();
        for (Object element : elements) {
            array.put(element);
        }
        return array;
    }

    public void testOpening_Create_HappyCase() throws Exception {
        int requestedVersion = 1;
        String dbName = "testDatabase";

        mOpeningConfig.put("version", requestedVersion);
        mOpeningConfig.put("txId", txId);
        mPrefs.edit().remove("db_revision_" + dbName).commit();

        // FIRST call db_openOrCreate_
        mBackend.db_openOrCreate_(dbName, mOpeningConfig);
        assertNotNull(mBackend.getTransaction(txId));
        mJS.verifyCalledCallbacks("onCreate");
        mJS.verifyDeletedCallbacks("onCreate", "onUpdate");

        // SECOND, in response to onCreate, call beginTransaction

        JSONObject transactionConfig = new JSONObject();
        transactionConfig.put("dbName", "testDatabase");
        transactionConfig.put("txId", txId);

        mBackend.beginTransaction_(transactionConfig);

        mBackend.tx_appendToOpenerScript_(txId, newJSONArray(newJSONArray("rowset", "SQL", newJSONArray(4, 5, 6))));

        mBackend.endTransaction_(txId);
        assertNull(mBackend.getTransaction(txId));
        mJS.verifyCalledCallbacks("onCreate", "onOpened");
        mJS.verifyDeletedCallbacks("onCreate", "onUpdate", "onOpened", "onError");
        
        assertEquals(requestedVersion, mPrefs.getInt("db_revision_" + dbName, -1));
    }

    public void testOpening_Create_ErrorCase() throws Exception {
        int requestedVersion = 1;
        String dbName = "testDatabase";

        mOpeningConfig.put("version", requestedVersion);
        mOpeningConfig.put("txId", txId);
        mPrefs.edit().remove("db_revision_" + dbName).commit();

        // FIRST call db_openOrCreate_
        mBackend.db_openOrCreate_(dbName, mOpeningConfig);
        assertNotNull(mBackend.getTransaction(txId));
        mJS.verifyCalledCallbacks("onCreate");
        mJS.verifyDeletedCallbacks("onCreate", "onUpdate");

        // SECOND, in response to onCreate, call beginTransaction

        JSONObject transactionConfig = new JSONObject();
        transactionConfig.put("dbName", "testDatabase");
        transactionConfig.put("txId", txId);

        mBackend.beginTransaction_(transactionConfig);

        // 'ERROR' in the SQL will cause an error to be thrown, but only in this
        // dummy impl.
        mBackend.tx_appendToOpenerScript_(txId, newJSONArray(newJSONArray("rowset", "ERROR")));

        mBackend.endTransaction_(txId);
        assertNull(mBackend.getTransaction(txId));
        mJS.verifyCalledCallbacks("onCreate", "onError");
        mJS.verifyDeletedCallbacks("onCreate", "onUpdate", "onOpened", "onError");
        
        assertEquals(-1, mPrefs.getInt("db_revision_" + dbName, -1));
    }

    public void testOpening_Update_HappyCase() throws Exception {
        int existingVersion = 1;
        int requestedVersion = 2;
        String dbName = "testDatabase";

        mOpeningConfig.put("version", requestedVersion);
        mOpeningConfig.put("txId", txId);
        mPrefs.edit().putInt("db_revision_" + dbName, existingVersion).commit();

        // FIRST call db_openOrCreate_
        mBackend.db_openOrCreate_(dbName, mOpeningConfig);
        assertNotNull(mBackend.getTransaction(txId));
        mJS.verifyCalledCallbacks("onUpdate");
        mJS.verifyDeletedCallbacks("onCreate", "onUpdate");

        // SECOND, in response to onCreate, call beginTransaction

        JSONObject transactionConfig = new JSONObject();
        transactionConfig.put("dbName", "testDatabase");
        transactionConfig.put("txId", txId);

        mBackend.beginTransaction_(transactionConfig);

        mBackend.tx_appendToOpenerScript_(txId, newJSONArray(newJSONArray("rowset", "SQL", newJSONArray(4, 5, 6))));

        mBackend.endTransaction_(txId);
        assertNull(mBackend.getTransaction(txId));
        mJS.verifyCalledCallbacks("onUpdate", "onOpened");
        mJS.verifyDeletedCallbacks("onCreate", "onUpdate", "onOpened", "onError");
        
        assertEquals(requestedVersion, mPrefs.getInt("db_revision_" + dbName, -1));
    }

    public void testOpening_Update_ErrorCase() throws Exception {
        int existingVersion = 1;
        int requestedVersion = 2;
        String dbName = "testDatabase";

        mOpeningConfig.put("version", requestedVersion);
        mOpeningConfig.put("txId", txId);
        mPrefs.edit().putInt("db_revision_" + dbName, existingVersion).commit();

        // FIRST call db_openOrCreate_
        mBackend.db_openOrCreate_(dbName, mOpeningConfig);
        assertNotNull(mBackend.getTransaction(txId));
        mJS.verifyCalledCallbacks("onUpdate");
        mJS.verifyDeletedCallbacks("onCreate", "onUpdate");

        // SECOND, in response to onCreate, call beginTransaction

        JSONObject transactionConfig = new JSONObject();
        transactionConfig.put("dbName", "testDatabase");
        transactionConfig.put("txId", txId);

        mBackend.beginTransaction_(transactionConfig);

        // 'ERROR' in the SQL will cause an error to be thrown, but only in this
        // dummy impl.
        mBackend.tx_appendToOpenerScript_(txId, newJSONArray(newJSONArray("rowset", "ERROR")));

        mBackend.endTransaction_(txId);
        assertNull(mBackend.getTransaction(txId));
        mJS.verifyCalledCallbacks("onUpdate", "onError");
        mJS.verifyDeletedCallbacks("onCreate", "onUpdate", "onOpened", "onError");
        
        assertEquals(existingVersion, mPrefs.getInt("db_revision_" + dbName, -1));
    }

    public void testTransaction_appendToScript() {
        mBackend.beginTransaction_(mTransactionConfig);

        DBTransaction tx = mBackend.getTransaction(txId);
        assertNotNull(tx);

        List<DBStatement> statements = tx.getEntries();
        assertTrue(statements.isEmpty());

        mBackend.appendToScript(txId, newJSONArray(newJSONArray("rowset", "STATEMENT 0", newJSONArray(),
                "onSQLSuccess0", "onSQLError0"),//
                newJSONArray("row", "STATEMENT 1", newJSONArray("foo"), "onSQLSuccess1")));
        assertFalse(statements.isEmpty());
        assertEquals(2, statements.size());

        DBStatement s0 = statements.get(0);
        assertEquals(StatementType.rowset, s0.mType);
        assertEquals("STATEMENT 0", s0.mSql);
        assertEquals(0, s0.mParams.length);
        assertEquals("onSQLSuccess0", s0.mOnSuccess);
        assertEquals("onSQLError0", s0.mOnError);

        s0 = statements.get(1);
        assertEquals(StatementType.row, s0.mType);
        assertEquals("STATEMENT 1", s0.mSql);
        assertTrue(Arrays.deepEquals(new Object[] { "foo" }, s0.mParams));
        assertEquals("onSQLSuccess1", s0.mOnSuccess);
        assertNull("onError is " + s0.mOnError, s0.mOnError);

    }

    public void testTransaction_HappyCase() throws JSONException {
        mTransactionConfig.put("onSuccessToken", "txSuccess");
        mTransactionConfig.put("onErrorToken", "txError");
        mBackend.beginTransaction_(mTransactionConfig);

        mBackend.tx_appendToTransactionScript_(txId, newJSONArray(newJSONArray("rowset", "SQL0", newJSONArray(1, 2, 3),
                "success0", "error0"), newJSONArray("rowset", "SQL1", newJSONArray(4, 5, 6), "success1", "error1")));

        mBackend.endTransaction_(txId);

        mJS.verifyCalledCallbacks("success0", "success1", "txSuccess");
        mJS.verifyDeletedCallbacks("txSuccess", "txError", "error0", "error1", "success1", "success0");

    }

    public void testTransaction_ErrorCase() throws JSONException {
        mTransactionConfig.put("onSuccessToken", "txSuccess");
        mTransactionConfig.put("onErrorToken", "txError");
        mBackend.beginTransaction_(mTransactionConfig);

        mBackend.tx_appendToTransactionScript_(txId, //
                newJSONArray(//
                        newJSONArray("rowset", "SQL0", newJSONArray(1, 2, 3), "success0", "error0"), //
                        newJSONArray("rowset", "SQL1", newJSONArray(4, 5, 6), "success1", "error1"),//
                        newJSONArray("rowset", "SQL2", newJSONArray(1, 2, 3), "success2", "error2"), //
                        newJSONArray("rowset", "ERROR", newJSONArray(4, 5, 6), "success3", "error3")//
                ));

        mBackend.endTransaction_(txId);

        mJS.verifyCalledCallbacks("error3", "txError");
        mJS.verifyDeletedCallbacks("txSuccess", "txError", // 
                "error0", "error1", "error2", "error3", //
                "success0", "success1", "success2", "success3");

    }

    public void testCoerceToJSONObject() throws JSONException {
        String[] columnNames = new String[] { "foo", "bar", "baz" };
        MatrixCursor cursor = new MatrixCursor(columnNames);
        cursor.addRow(new Object[] { 1, 2, 3 });

        cursor.moveToFirst();

        JSONObject obj = mBackend.coerceToJSONObject(columnNames, cursor);

        assertEquals(1, obj.getInt("foo"));
        assertEquals(2, obj.getInt("bar"));
        assertEquals(3, obj.getInt("baz"));
    }

    public void testCoerceToJSONArray() throws JSONException {
        String[] columnNames = new String[] { "foo", "bar", "baz" };
        MatrixCursor cursor = new MatrixCursor(columnNames);
        cursor.addRow(new Object[] { 1, 2, 3 });
        cursor.addRow(new Object[] { 4, 5, 6 });
        cursor.addRow(new Object[] { 7, 8, 9 });

        cursor.moveToFirst();

        JSONArray array = mBackend.coerceToJSONArray(columnNames, cursor);

        assertEquals(3, array.length());

        JSONObject obj = array.getJSONObject(0);
        assertEquals(1, obj.getInt("foo"));
        assertEquals(2, obj.getInt("bar"));
        assertEquals(3, obj.getInt("baz"));

        obj = array.getJSONObject(1);
        assertEquals(4, obj.getInt("foo"));
        assertEquals(5, obj.getInt("bar"));
        assertEquals(6, obj.getInt("baz"));

        obj = array.getJSONObject(2);
        assertEquals(7, obj.getInt("foo"));
        assertEquals(8, obj.getInt("bar"));
        assertEquals(9, obj.getInt("baz"));
    }

    public void testResultTypes_row() throws JSONException {
        mResults = new Object[][] { { 1, 2, 3 } };

        mBackend.beginTransaction_(mTransactionConfig);

        mBackend.tx_appendToTransactionScript_(txId, newJSONArray(newJSONArray("row", "SQL0", newJSONArray("main", 45,
                4), "success0", "error0")));

        mBackend.endTransaction_(txId);

        mJS.verifyCallback("success0", new JSONObject("{foo:'1',bar:'2',baz:'3'}"));
    }

    public void testResultTypes_array() throws JSONException {
        mResults = new Object[][] { { 1, 2, 3 }, { 5, 7, 11 }, { 13, 17, 19 } };

        mBackend.beginTransaction_(mTransactionConfig);

        mBackend.tx_appendToTransactionScript_(txId, newJSONArray(newJSONArray("array", "SQL0", newJSONArray("main",
                45, 4), "success0", "error0")));

        mBackend.endTransaction_(txId);

        mJS.verifyCallback("success0", new JSONArray("[{foo:'1',bar:'2',baz:'3'}," + //
                "{foo:'5',bar:'7',baz:'11'}," + //
                "{foo:'13',bar:'17',baz:'19'}]"));
    }

    public void testResultTypes_rowset() throws JSONException {
        mResults = new Object[][] { { 1, 2, 3 }, { 5, 7, 11 }, { 13, 17, 19 } };

        mBackend.beginTransaction_(mTransactionConfig);

        mBackend.tx_appendToTransactionScript_(txId, newJSONArray(newJSONArray("rowset", "SQL0", newJSONArray("main",
                45, 4), "success0", "error0")));

        mBackend.endTransaction_(txId);

        Object[] args = mJS.getCallbackArgs("success0");
        assertEquals(1, args.length);
        String dropboxKey = (String) args[0];

        // an artefact of testing...
        dropboxKey = dropboxKey.replaceAll("\"", "");

        Log.i(C.TAG, "Dropbox key is: '" + dropboxKey + "'");
        assertEquals(mCursor, mJS.getDropbox().consume(dropboxKey));
    }

    public void testStatementType_file() throws JSONException {
        mBackend.beginTransaction_(mTransactionConfig);

        mBackend.tx_appendToTransactionScript_(txId, newJSONArray(//
                newJSONArray("file", "/databases/dummyFile.sql", newJSONArray("main", 45, 4), "success0", "error0")//
        ));

        mBackend.endTransaction_(txId);
        
        assertEquals(Arrays.asList("ASSETS SQL 0", "ASSETS SQL 1", "ASSETS SQL 2"), mExecutedSQL);
    }
}
