DROP TABLE IF EXISTS localNotifications;

CREATE TABLE localNotifications (
    id       INTEGER
             PRIMARY KEY AUTOINCREMENT,
    
    title    TEXT DEFAULT "Alert",
    body     TEXT NOT NULL,
    
    time     INTEGER NOT NULL,
    -- the time interval when after which the notification will not be fired.
    epsilon  INTEGER DEFAULT (1000 * 60 * 24 * 365),
    
    vibrate  INTEGER DEFAULT 0,
    sound    INTEGER DEFAULT 0    
);