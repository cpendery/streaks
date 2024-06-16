DROP TABLE IF EXISTS events;
CREATE TABLE IF NOT EXISTS events (
	id INTEGER PRIMARY KEY,
	uid TEXT,
	sid TEXT,
    name TEXT,
    complete INTEGER,
    date INTEGER
);

INSERT INTO events (uid, sid, name, complete, date) VALUES ('875fbbc7-2f7d-4008-a9b5-87741fae4776', '65108554-727e-4221-a47e-9abbc9239a74', 'Event 1', 0, 1724457600000);
INSERT INTO events (uid, sid, name, complete, date) VALUES ('975fbbc7-2f7d-4008-a9b5-87741fae4776', '95108554-727e-4221-a47e-9abbc9239a74', 'Event 2', 0, 1724544000000);
INSERT INTO events (uid, sid, name, complete, date) VALUES ('175fbbc7-2f7d-4008-a9b5-87741fae4775', '15108554-727e-4221-a47e-9abbc9239a74', 'Event 3', 1, 1717718400000);
INSERT INTO events (uid, sid, name, complete, date) VALUES ('175fbbc7-2f7d-4008-a9b5-87741fae4776', '15108554-727e-4221-a47e-9abbc9239a74', 'Event 3', 1, 1717632000000);
INSERT INTO events (uid, sid, name, complete, date) VALUES ('175fbbc7-2f7d-4008-a9b5-87741fae4776', '15108554-727e-4221-a47e-9abbc9239a74', 'Event 3', 1, 1717545600000);
INSERT INTO events (uid, sid, name, complete, date) VALUES ('175fbbc7-2f7d-4008-a9b5-87741fae4777', '15108554-727e-4221-a47e-9abbc9239a74', 'Event 4', 1, 1717718400000);
INSERT INTO events (uid, sid, name, complete, date) VALUES ('175fbbc7-2f7d-4008-a9b5-87741fae4778', '15108554-727e-4221-a47e-9abbc9239a74', 'Event 5', 1, 1717718400000);

DROP TABLE IF EXISTS tags;
CREATE TABLE IF NOT EXISTS tags (
	id INTEGER PRIMARY KEY,
	name TEXT
);

DROP TABLE IF EXISTS event_tags;
CREATE TABLE IF NOT EXISTS event_tags (
	id INTEGER PRIMARY KEY,
	event_id INTEGER,
    tag_id INTEGER
);

INSERT INTO tags (name) VALUES ('tag 1');
INSERT INTO tags (name) VALUES ('tag 2');
INSERT INTO event_tags (event_id, tag_id) VALUES (1, 1);
INSERT INTO event_tags (event_id, tag_id) VALUES (1, 2);