/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import Pusher from "pusher-js";
import Logs from "./results/Logs";
import ThemeToggle from "./ui/theme-toggle";
import WatchList from "./tabs/WatchList";
import Connections from "./results/Connections";
import UserButton from "./user-button/UserButton";
import NewSearch from "./tabs/NewSearch";
import { FormData, Connection, Profile } from "@/lib/types";
import { addToDatabase, fetchAllProfiles } from "@/lib/addToDatabase";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";

export default function LinkedInScraper() {
  const [profilePicture, setProfilePicture] = useState<string>("");
  const { user } = useUser();
  const [logs, setLogs] = useState<string[]>([]);
  const [scrapedData, setScrapedData] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [profileName, setProfileName] = useState("");
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [connections, setConnections] = useState<Connection[] | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [refetchProfiles, setRefetchProfiles] = useState(false);
  const [scrapingProfileId, setScrapingProfileId] = useState<number | null>(
    null
  );
  const [formData, setFormData] = useState<FormData>({
    profileUrl: "",
    name: "",
    picture: "",
    location: "",
    company: "",
    title: "",
    followingCompany: false,
    sessionCookie: "",
  });

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const scrapeChannel = pusher.subscribe("scrape-channel");
    scrapeChannel.bind("scrape-log", function (data: { message: string }) {
      setLogs((prevLogs) => {
        const updatedLogs = [...prevLogs, data.message];
        return updatedLogs.slice(-15);
      });
    });

    const profileNameChannel = pusher.subscribe("profile-name-channel");
    profileNameChannel.bind("name", function (data: { name: string }) {
      setProfileName(data.name);
    });

    const connectionsChannel = pusher.subscribe("connections-channel");
    connectionsChannel.bind(
      "connection",
      function (data: { connection: Connection }) {
        setConnections((prev) => [data.connection, ...(prev ?? [])]);
      }
    );

    return () => {
      scrapeChannel.unbind_all();
      scrapeChannel.unsubscribe();
      profileNameChannel.unbind_all();
      profileNameChannel.unsubscribe();
      connectionsChannel.unbind_all();
      connectionsChannel.unsubscribe();
    };
  }, [elapsedTime]);

  useEffect(() => {
    setProfilePicture(user?.imageUrl || "");
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoading) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
        setTotalElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
      setElapsedTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const fetchProfiles = async () => {
    const leads = await fetchAllProfiles();
    setProfiles(leads);
    console.log("profiles", leads);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (refetchProfiles) {
      fetchProfiles();
      setRefetchProfiles(false);
    }
  }, [refetchProfiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleScrape = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    setScrapedData([]);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const newProfile: any = {
          name: data.profile,
          url: formData.profileUrl,
          company: formData.company,
          location: formData.location,
          title: formData.title,
          connections: data.content,
          recents: [],
          reviewed: new Date().toISOString(),
          time: elapsedTime,
          sessionCookie: formData.sessionCookie,
        };
        console.log("newProfile", newProfile);
        addToDatabase(newProfile);

        setSuccess("Scraping successful!");

        setTimeout(() => {
          setRefetchProfiles(true);
        }, 2000);
        setElapsedTime(0);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (error) {
      setError((error as Error).message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full relative w-full duration-500 flex gap-3 p-4 ">
      <ResizablePanelGroup direction="horizontal" className="gap-2 ">
        <ResizablePanel defaultSize={45} minSize={35} maxSize={50}>
          <div className="flex flex-row justify-between">
            <UserButton profilePicture={profilePicture} />
          </div>
          <ResizablePanelGroup direction="vertical" className="gap-2 relative ">
            <ResizablePanel defaultSize={48}>
              <Card className="h-full overflow-scroll hide-scrollbars ">
                <CardContent className="p-[1.2rem] relative ">
                  <Tabs defaultValue="form">
                    <TabsList className="grid grid-cols-2 mb-4 z-50 sticky top-5 rounded-[20px] bg-[#22546d] h-full">
                      <TabsTrigger value="form">New Search</TabsTrigger>
                      <TabsTrigger value="results">Watch List</TabsTrigger>
                    </TabsList>
                    <TabsContent value="form">
                      <NewSearch
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleScrape={handleScrape}
                        isLoading={isLoading}
                        elapsedTime={elapsedTime}
                        error={error}
                        success={success}
                      />
                    </TabsContent>
                    <TabsContent value="results">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <WatchList
                          profiles={profiles}
                          setProfiles={setProfiles}
                          onSelectProfile={setSelectedProfile}
                          selectedProfile={selectedProfile}
                          setIsLoading={setIsLoading}
                          setError={setError}
                          setSuccess={setSuccess}
                          setScrapedData={setScrapedData}
                          sessionCookie={formData.sessionCookie}
                          scrapingProfileId={scrapingProfileId}
                          setScrapingProfileId={setScrapingProfileId}
                          fetchProfiles={fetchProfiles}
                        />
                      </motion.div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={52} className="">
              <Card className="hide-scrollbars">
                <CardContent className="p-[1.2rem] ">
                  <Logs logs={logs} />
                </CardContent>
              </Card>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={55}>
          <Card className="w-full h-full overflow-y-scroll hide-scrollbars">
            <CardContent className="p-[1.2rem] h-auto z-50">
              <Connections profiles={selectedProfile?.connections} />
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
