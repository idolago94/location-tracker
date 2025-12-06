import { type NitroSQLiteConnection, open } from 'react-native-nitro-sqlite';

const DB_NAME = 'locations-tracker-v3.sqlite';
const LOCATIONS_TABLE_NAME = 'locations';

export interface LocationRow {
  id: number;
  latitude: number;
  longitude: number;
  timestamp: number;
  no_motion_notified: 0 | 1;
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
        no_motion_notified INTEGER NOT NULL DEFAULT 0
      );
    `);
  }

  async insert(location: Omit<LocationRow, 'id' | 'no_motion_notified'>) {
    const result = await this.db.execute(
      `
      INSERT INTO ${LOCATIONS_TABLE_NAME} 
      (latitude, longitude, timestamp)
      VALUES (?, ?, ?)
      `,
      [location.latitude, location.longitude, location.timestamp],
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
    })) as LocationRow[];
  }

  async clear() {
    await this.db.execute(`DELETE FROM ${LOCATIONS_TABLE_NAME}`);
  }
}

export default new LocationsStorage();
