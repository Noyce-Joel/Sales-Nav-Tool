/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

async function createProfilesTable() {
  const client = await db.connect();
  try {
    await client.sql`
      CREATE TABLE IF NOT EXISTS Profiles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        url TEXT,
        company VARCHAR(255),
        location VARCHAR(255),
        title VARCHAR(255),
        connections JSONB,  -- Storing connections as JSONB
        recents JSONB,  -- Storing connections as JSONB
        reviewed TIMESTAMP
      );
    `;
  } catch (error) {
    console.error("Error creating profiles table:", error);
  } finally {
    client.release();
  }
}

export async function POST(request: NextRequest) {
  const client = await db.connect();

  await createProfilesTable();

  try {
    const { name, url, company, location, connections, recents, reviewed, title } =
      await request.json();

    if (
      !Array.isArray(connections) ||
      !connections.every((conn) => typeof conn === "object" && conn.leadId)
    ) {
      throw new Error(
        "Invalid connections format. It should be an array of objects with a leadId property."
      );
    }

    await client.sql`
      INSERT INTO Profiles (name, url, company, location, connections, recents, reviewed, title) 
      VALUES (${name}, ${url}, ${company}, ${location}, ${JSON.stringify(
      connections
    )}, ${JSON.stringify(recents)}, ${reviewed}, ${title});
    `;

    return NextResponse.json(
      { message: "Profile added successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error inserting profile:", error);
    const errorMessage =
      (error as Error).message || "An unexpected error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(request: NextRequest) {
  const client = await db.connect();

  try {
    const { id, recents, connections } = await request.json();

    // Fetch the existing profile
    const existingProfile = await client.sql`
      SELECT recents, connections FROM Profiles WHERE id = ${id};
    `;

    if (existingProfile.rows.length === 0) {
      throw new Error(`Profile with ID ${id} not found.`);
    }

    const existingRecents = existingProfile.rows[0].recents || [];
    const existingConnections = existingProfile.rows[0].connections || [];

    // Append the new recents to both recents and connections
    const updatedRecents = [...existingRecents, ...recents];
    const updatedConnections = [...existingConnections, ...recents]; // recents should be added to connections

    // If connections are provided, merge them with the existing connections
    if (connections) {
      updatedConnections.push(...connections);
    }

    // Update the profile with the appended data
    await client.sql`
      UPDATE Profiles 
      SET recents = ${JSON.stringify(updatedRecents)}, 
          connections = ${JSON.stringify(updatedConnections)}
      WHERE id = ${id};
    `;

    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    const errorMessage =
      (error as Error).message || "An unexpected error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    client.release();
  }
}



export async function GET() {
  const client = await db.connect();

  try {
    const profiles = await client.sql`SELECT * FROM Profiles;`;
    return NextResponse.json({ profiles: profiles.rows }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(request: Request) {
  const client = await db.connect();
  const { id } = await request.json();

  try {
    // Delete the profile with the given id
    await client.sql`
      DELETE FROM Profiles
      WHERE id = ${id};
    `;

    return NextResponse.json(
      { message: "Profile deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting profile:", error);
    const errorMessage =
      (error as Error).message || "An unexpected error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    client.release();
  }
}
