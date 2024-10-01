import { Connection, Profile } from "./types";

const addToDatabase = async (profile: Profile | null) => {
  if (!profile) return;

  try {
    const response = await fetch("/api/database", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: profile.name,
        url: profile.url,
        company: profile.company,
        location: profile.location,
        title: profile.title,
        connections: profile.connections,
        recents: profile.recents,
        reviewed: profile.reviewed,
        time: profile.time,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong");
    }
  } catch (error) {
    console.error(error);
  }
};

async function addRecentsToDatabase(
  recents: Connection[],
  profileId: number,
 
) {
  try {
    const updateData: {
      id: number;
      recents: Connection[];
      connections?: Connection[];
    } = {
      id: profileId,
      recents: recents,
    };

    console.log("Sending update to server:", updateData);

    const response = await fetch("/api/database", {  
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Database update result:", result);
    return result;
  } catch (error) {
    console.error("Error updating database:", error);
    throw error;
  }
}

const fetchAllProfiles = async (): Promise<Profile[]> => {
  try {
    const response = await fetch("/api/database", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    return data.profiles as Profile[];
  } catch (error) {
    console.error(error);
    return [];
  }
};




const deleteProfile= async (id: number): Promise<void> => {
  try {
    const response = await fetch(`/api/database`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete profile: ${response.statusText}`);
    }

    console.log(`Profile with id ${id} deleted successfully`);
  } catch (error) {
    console.error("Error deleting profile:", error);
    throw error;
  }
};

export { addToDatabase, addRecentsToDatabase, fetchAllProfiles, deleteProfile };
