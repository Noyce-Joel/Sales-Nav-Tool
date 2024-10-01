/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon, TrashIcon } from "lucide-react";
import { Connection, Profile } from "@/lib/types";
import { addRecentsToDatabase, deleteProfile } from "@/lib/addToDatabase";

export default function WatchList({
  profiles,
  setProfiles,
  selectedProfile,
  onSelectProfile,
  setIsLoading,
  setError,
  setSuccess,
  setScrapedData,
  sessionCookie,
  scrapingProfileId,
  setScrapingProfileId,
  fetchProfiles,
}: {
  profiles?: Profile[] | null;
  setProfiles: React.Dispatch<React.SetStateAction<Profile[] | null>>;
  selectedProfile: Profile | null;
  onSelectProfile: (profile: Profile) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
  setScrapedData: React.Dispatch<React.SetStateAction<any[]>>;
  sessionCookie: string;
  scrapingProfileId: number | null;
  setScrapingProfileId: React.Dispatch<React.SetStateAction<number | null>>;
  fetchProfiles: () => Promise<void>;
}) {
  const [refetchRecents, setRefetchRecents] = useState(false);
  useEffect(() => {
    if (refetchRecents) {
      fetchProfiles();
      setRefetchRecents(false);
    }
  }, [refetchRecents, fetchProfiles]);

  const handleRecentsScrape = async (data: Profile) => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    setScrapedData([]);
    setScrapingProfileId(data.id);

    try {
      console.log("Profile data being sent:", data, sessionCookie);
      const response = await fetch("/api/recents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data, sessionCookie }),
      });

      if (!response.ok) {
        throw new Error("Error scraping recents");
      }

      const resultData = await response.json();
      console.log("Recents scrape result:", resultData);

      const validConnections = resultData.content.filter(
        (connection: Connection) =>
          typeof connection === "object" &&
          connection.name &&
          typeof connection.name === "string"
      );

      if (validConnections.length === 0) {
        throw new Error("No valid connections found in scraped data");
      }

      setScrapedData(validConnections);
      console.log("Valid scraped data:", validConnections);

      const recents = validConnections.map((connection: Connection) => ({
        name: connection.name,
        picture: connection.picture,
        linkedinUrl: connection.linkedinUrl,
        title: connection.title,
        company: connection.company,
        location: connection.location,
      }));

      await addRecentsToDatabase(recents, data.id);
      setTimeout(() => {
        setRefetchRecents(true);
      }, 2000);
      setSuccess("Recents scraped and database updated successfully");
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to scrape recents"
      );
    } finally {
      setIsLoading(false);
      setScrapingProfileId(null);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Not reviewed";
    const dateObject = new Date(date);
    return dateObject.toLocaleDateString();
  };
  const handleDeleteProfile = async (profileId: number) => {
    try {
      await deleteProfile(profileId);
      setSuccess("Profile deleted successfully");
      // Optionally, you can refresh the profiles list or remove the deleted profile from the state
    } catch (error) {
      console.error("Error deleting profile:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete profile"
      );
    }
  };

  return (
    <Table className="p-0">
      <TableHeader>
        <TableRow className="border-b border-gray-200 text-gray-400">
          <TableHead className="w-[300px]">Name</TableHead>
          <TableHead>New</TableHead>
          <TableHead className="w-[150px]">Filters</TableHead>
          <TableHead className="w-[150px]">Date</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {profiles?.map((profile, index) => (
          <TableRow
            key={`${profile.url}-${index}`}
            className={`group transition-all ${
              selectedProfile?.id === profile.id
                ? "bg-[#3d667b] rounded-full"
                : "hover:bg-[#3d667b] hover:rounded-full cursor-pointer"
            }
            ${
              scrapingProfileId === profile.id
                ? "bg-[#3d667b] rounded-full animate-pulse"
                : "hover:bg-[#3d667b] hover:rounded-full cursor-pointer"
            }    
            `}
            onClick={() => onSelectProfile(profile)}
          >
            <TableCell className="">
              <div className="space-x-1 pt-1.5">
                <span className="whitespace-nowrap font-bold overflow-hidden">
                  {profile.name || <p className="animate-pulse">Fetching</p>}
                </span>
                <span className="whitespace-nowrap font-thin text-xs overflow-hidden">
                  {profile.connections?.length || <p className="animate-pulse">-</p>}
                </span>
              </div>
            </TableCell>
            <TableCell className="">
              <div className="space-x-1 pt-1.5">
              <span className="whitespace-nowrap font-thin text-xs overflow-hidden border border-gray-300 rounded-full px-1">
                  {profile.recents?.length || <span className="animate-pulse ">0</span>}
                </span>
              </div>
            </TableCell>

            <TableCell className="">
              <div className="flex items-center space-x-1">
                {profile.location && (
                  <span className="whitespace-nowrap overflow-hidden rounded-full border px-2">
                    {profile.location}
                  </span>
                )}
                {profile.company && (
                  <span className="whitespace-nowrap overflow-hidden rounded-full border px-2">
                    {profile.company}
                  </span>
                )}
                {profile.title && (
                  <span className="whitespace-nowrap overflow-hidden rounded-full border px-2">
                    {profile.title}
                  </span>
                )}
              </div>
            </TableCell>

            <TableCell className="">
              <div className="flex items-center space-x-1">
                <span className="whitespace-nowrap overflow-hidden">
                  {formatDate(profile.reviewed)}
                </span>
              </div>
            </TableCell>

            <TableCell className="">
              <div className="flex items-center space-x-1">
                <Button
                  className="p-2 w-8 h-8 flex items-center hover:bg-gray-300 transition-all duration-150 rounded-xl hover:text-black active:scale-90"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRecentsScrape(profile);
                  }}
                >
                  <RefreshCwIcon size={12} />
                </Button>
              </div>
            </TableCell>
            <TableCell className="">
              <Button
                className="p-2 w-8 h-8 flex items-center hover:bg-gray-300 transition-all duration-150 rounded-xl hover:text-black active:scale-90"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProfile(profile.id);
                  deleteProfile(profile.id)
                    .then(() => {
                      setProfiles((prevProfiles) =>
                        (prevProfiles ?? []).filter((p) => p.id !== profile.id)
                      );
                    })
                    .catch((error) => {
                      console.error("Error deleting profile:", error);
                    });
                }}
              >
                <TrashIcon size={12} />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
