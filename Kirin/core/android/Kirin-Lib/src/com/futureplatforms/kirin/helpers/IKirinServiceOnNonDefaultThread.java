package com.futureplatforms.kirin.helpers;

import java.util.concurrent.Executor;

public interface IKirinServiceOnNonDefaultThread {
	Executor getExecutor();
}
