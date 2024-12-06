import client from "../db/client.ts";

export type Reservation = {
  id: number,
  reserver?: string,
  resourceId: number,
  resourceName: string,
  startDate: Date,
  endDate: Date
}

export const getAllReservations = async () => {
  const result = await client.queryArray(`
    SELECT
      r.reservation_id,
      u.username AS reserver_username,
      res.resource_id,
      res.resource_name,
      r.reservation_start,
      r.reservation_end
    FROM cbkapp_reservations r
    JOIN cbkapp_resources res ON r.resource_id = res.resource_id
    JOIN cbkapp_users u ON r.reserver_token = u.user_token;
  `);
  const reservations: Array<Reservation> = [];
  for(let i = 0; i < result.rows.length; i++) {
    const row = result.rows[i];
    reservations.push({
      id: Number(row[0]),
      reserver: row[1],
      resourceId: Number(row[2]),
      resourceName: row[3],
      startDate: new Date(row[4] as string),
      endDate: new Date(row[5] as string)
    } as Reservation);
  }
  return reservations;
} 

export const getReservationById = async (id: number) => {
  const result = await client.queryArray(`
    SELECT
      r.reservation_id,
      u.username AS reserver_username,
      res.resource_id,
      res.resource_name,
      r.reservation_start,
      r.reservation_end
    FROM cbkapp_reservations r
    JOIN cbkapp_resources res ON r.resource_id = res.resource_id
    JOIN cbkapp_users u ON r.reserver_token = u.user_token
    WHERE r.reservation_id = $1;
  `, [id]);
  if(result.rowCount !== 1)
    return null;
  
  const row = result.rows[0];
  return {
    id: Number(row[0]),
    reserver: row[1],
    resourceId: Number(row[2]),
    resourceName: row[3],
    startDate: new Date(row[4] as string),
    endDate: new Date(row[5] as string)
  } as Reservation;
} 

export const isResourceReserved = async (resourceId: number, reservationStart: Date, reservationEnd: Date) => {
  const result = await client.queryArray(`
    SELECT
      r.reservation_id,
      u.username AS reserver_username,
      res.resource_id,
      res.resource_name,
      r.reservation_start,
      r.reservation_end
    FROM cbkapp_reservations r
    JOIN cbkapp_resources res ON r.resource_id = res.resource_id
    JOIN cbkapp_users u ON r.reserver_token = u.user_token
    WHERE res.resource_id = $1
      AND r.reservation_start < $3
      AND r.reservation_end > $2;
  `, [resourceId, reservationStart, reservationEnd]);
  return result.rowCount && result.rowCount > 0;
} 

export const createReservation = async (reserverToken: string, resourceId: number, reservationStart: Date, reservationEnd: Date) => {
  const result = await client.queryArray(
    `
    WITH inserted AS (
      INSERT INTO cbkapp_reservations (reserver_token, resource_id, reservation_start, reservation_end)
      VALUES ($1, $2, $3, $4)
      RETURNING reservation_id, reserver_token, resource_id, reservation_start, reservation_end
    )
    SELECT
      i.reservation_id,
      u.username AS reserver_username,
      res.resource_id,
      res.resource_name,
      i.reservation_start,
      i.reservation_end
    FROM inserted i
    JOIN cbkapp_resources res ON i.resource_id = res.resource_id
    JOIN cbkapp_users u ON i.reserver_token = u.user_token;
    `,
    [reserverToken, resourceId, reservationStart.toISOString(), reservationEnd.toISOString()]
  );
  if(result.rows.length !== 1)
    return null;
  const row = result.rows[0];
  return {
    id: Number(row[0]),
    reserver: row[1],
    resourceId: Number(row[2]),
    resourceName: row[3],
    startDate: new Date(row[4] as string),
    endDate: new Date(row[5] as string)
  } as Reservation;
}

export const deleteReservationById = async (id: number) => {
  const result = await client.queryArray(
    `DELETE FROM cbkapp_reservations WHERE reservation_id = $1`,
    [id]
  );
  return result.rowCount && result.rowCount > 0;
}
