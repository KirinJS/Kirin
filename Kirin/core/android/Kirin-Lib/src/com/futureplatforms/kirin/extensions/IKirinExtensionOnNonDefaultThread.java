package com.futureplatforms.kirin.extensions;

import java.util.concurrent.Executor;

public interface IKirinExtensionOnNonDefaultThread {
	Executor getExecutor();
}
