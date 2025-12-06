import { type NitroSQLiteConnection, open } from 'react-native-nitro-sqlite';

const DB_NAME = 'locations-tracker-v7.sqlite';
const LOCATIONS_TABLE_NAME = 'locations';

export interface LocationRow {
  id: number;
  latitude: number;
  longitude: number;
  timestamp: number;
  no_motion_notified: 0 | 1;
  is_moving: 0 | 1;
}

class LocationsStorage {
  private db: NitroSQLiteConnection;

  constructor() {
    this.db = open({ name: DB_NAME });
    this.db.execute(`
      CREATE TABLE IF NOT EXISTS ${LOCATIONS_TABLE_NAME} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timestamp INTEGER NOT NULL,
        no_motion_notified INTEGER NOT NULL DEFAULT 0,
        is_moving INTEGER NOT NULL DEFAULT 0
      );
    `);
  }

  async insert(
    location: Pick<LocationRow, 'latitude' | 'longitude' | 'timestamp'>,
  ) {
    const lastLocation = await this.getLast();

    let isMoving = true;
    if (
      lastLocation &&
      lastLocation.latitude === location.latitude &&
      lastLocation.longitude === location.longitude
    ) {
      isMoving = false;
    }

    const result = await this.db.execute(
      `
      INSERT INTO ${LOCATIONS_TABLE_NAME} 
      (latitude, longitude, timestamp, is_moving)
      VALUES (?, ?, ?, ?)
      `,
      [
        location.latitude,
        location.longitude,
        location.timestamp,
        isMoving ? 1 : 0,
      ],
    );

    return result.insertId;
  }

  async getAll(): Promise<LocationRow[]> {
    const result = await this.db.execute(
      `SELECT * FROM ${LOCATIONS_TABLE_NAME} ORDER BY timestamp DESC`,
    );

    const locationRows = result.rows?._array ?? [];
    return locationRows.map((r: any) => ({
      id: Number(r.id),
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      timestamp: Number(r.timestamp),
      no_motion_notified: Number(r.no_motion_notified),
      is_moving: Number(r.is_moving),
    })) as LocationRow[];
  }

  async getById(id: number) {
    const result = await this.db.execute(
      `
      SELECT *
      FROM locations
      WHERE id = ?
      LIMIT 1;
    `,
      [id],
    );

    if (result.rows && result.rows._array && result.rows._array.length) {
      const row = result.rows._array[0];
      return {
        id: Number(row.id),
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        timestamp: Number(row.timestamp),
        no_motion_notified: Number(row.no_motion_notified),
        is_moving: Number(row.is_moving),
      } as LocationRow;
    }
  }

  async getLast() {
    const result = await this.db.execute(
      `SELECT * FROM locations ORDER BY id DESC LIMIT 1;`,
    );

    if (result.rows && result.rows._array && result.rows._array.length) {
      const row = result.rows._array[0];
      return {
        id: Number(row.id),
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        timestamp: Number(row.timestamp),
        no_motion_notified: Number(row.no_motion_notified),
        is_moving: Number(row.is_moving),
      } as LocationRow;
    }
  }

  async getLastMoving() {
    const result = await this.db.execute(
      `
      SELECT * 
      FROM locations 
      WHERE is_moving = 1 
      ORDER BY id DESC 
      LIMIT 1;
      `,
    );

    if (result.rows && result.rows._array && result.rows._array.length) {
      const row = result.rows._array[0];
      return {
        id: Number(row.id),
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        timestamp: Number(row.timestamp),
        no_motion_notified: Number(row.no_motion_notified),
        is_moving: Number(row.is_moving),
      } as LocationRow;
    }
  }

  async markNoMotionNotified(id: number) {
    await this.db.execute(
      `UPDATE ${LOCATIONS_TABLE_NAME} SET no_motion_notified = 1 WHERE id = ?`,
      [id],
    );
  }

  async update(id: number, data: Omit<LocationRow, 'id'>) {
    await this.db.execute(
      `
      UPDATE locations
      SET
        latitude = ?,
        longitude = ?,
        timestamp = ?,
        is_moving = ?,
        no_motion_notified = ?
      WHERE id = ?
    `,
      [
        data.latitude,
        data.longitude,
        data.timestamp,
        data.is_moving,
        data.no_motion_notified,
        id,
      ],
    );
  }

  async delete(id: number) {
    await this.db.execute(`DELETE FROM locations WHERE id = ?`, [id]);
  }

  async clear() {
    await this.db.execute(`DELETE FROM ${LOCATIONS_TABLE_NAME}`);
  }
}

export default new LocationsStorage();
