package com.futureplatforms.kirin.extensions.fs;

import android.content.Context;

import com.futureplatforms.kirin.extensions.KirinExtensionAdapter;
import com.futureplatforms.kirin.generated.fs.KirinCallback;
import com.futureplatforms.kirin.generated.fs.KirinFile;
import com.futureplatforms.kirin.generated.fs.KirinFilesystemExtension;
import com.futureplatforms.kirin.generated.fs.KirinOptionalCallback;

public class KirinFilesystemExtensionImpl extends KirinExtensionAdapter
		implements KirinFilesystemExtension {

	public KirinFilesystemExtensionImpl(Context context) {
		super(context, "KirinFilesystem");
	}

	@Override
	public void readString(KirinFile file, KirinCallback javascriptListener) {
		// TODO Auto-generated method stub

	}

	@Override
	public void readJson(KirinFile file, KirinCallback javascriptListener) {
		// TODO Auto-generated method stub

	}

	@Override
	public void writeString(KirinFile file, String contents,
			KirinOptionalCallback javascriptListener) {
		// TODO Auto-generated method stub

	}

	@Override
	public void copy(KirinFile src, KirinOptionalCallback javascriptListener) {
		// TODO Auto-generated method stub

	}

	@Override
	public void list(KirinFile fileOrDir, KirinCallback javascriptListener) {
		// TODO Auto-generated method stub

	}

	@Override
	public void remove(KirinFile fileOrDir,
			KirinOptionalCallback javascriptListener) {
		// TODO Auto-generated method stub

	}

}
