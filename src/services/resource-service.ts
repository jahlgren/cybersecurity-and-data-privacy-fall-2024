import client from "../db/client.ts";

export type Resource = {
  id: number,
  name: string,
  description: string
}

export const getAllResources = async () => {
  const result = await client.queryArray(`SELECT resource_id, resource_name, resource_description FROM cbkapp_resources`);
  const resources: Array<Resource> = [];
  for(let i = 0; i < result.rows.length; i++) {
    const row = result.rows[i];
    resources.push({
      id: row[0] as number,
      name: row[1] as string,
      description: row[2] as string,
    } as Resource);
  }
  return resources;
} 

export const getResourceByName = async (name: string) => {
  const result = await client.queryArray(`SELECT resource_id, resource_name, resource_description FROM cbkapp_resources WHERE resource_name = $1`, [name]);
  if(result.rows.length !== 1)
    return null;
  const row = result.rows[0];
  return {
    id: row[0] as number,
    name: row[1] as string,
    description: row[2] as string,
  } as Resource;
} 

export const createResource = async (name: string, description: string) => {
  const result = await client.queryArray(
    `INSERT INTO cbkapp_resources (resource_name, resource_description) VALUES ($1, $2) RETURNING resource_id, resource_name, resource_description`,
    [name, description]
  );
  if(result.rows.length !== 1)
    return null;
  const row = result.rows[0];
  return {id: row[0], name: row[1], description: row[2]} as Resource;
}

export const deleteResourceById = async (id: number) => {
  const result = await client.queryArray(
    `DELETE FROM cbkapp_resources WHERE resource_id = $1`,
    [id]
  );
  return result.rowCount && result.rowCount > 0;
}
