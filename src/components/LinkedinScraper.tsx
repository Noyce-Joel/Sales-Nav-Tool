/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinkedinIcon, Search } from "lucide-react";
import Image from "next/image";
import Leads from "./results/Leads";
import { useUser } from "@clerk/nextjs";
import { formatTime } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import User from "./user-button/User";
import Pusher from "pusher-js";
import Logs from "./results/Logs";
import Searches from "./results/Searches";

type Profile = {
  name: string;
  linkedinUrl: string;
};

type FormData = {
  profileUrl: string;
  location: string;
  company: string;
  jobTitle: string;
  industry: string;
  followingCompany: boolean;
};

export default function LinkedInScraper() {
  const [profilePicture, setProfilePicture] = useState<string>("");
  const { user } = useUser();
  const [logs, setLogs] = useState<string[]>([]);
  const [leads, setLeads] = useState<any[]>([]); // State to store leads data
  const [scrapedData, setScrapedData] = useState<Profile[]>([]);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const scrapeChannel = pusher.subscribe("scrape-channel");
    scrapeChannel.bind("scrape-log", function (data: { message: string }) {
      setLogs((prevLogs) => {
        const updatedLogs = [...prevLogs, data.message];
        // Keep only the latest 15 logs
        return updatedLogs.slice(-15);
      });
    });

    // Listen to new leads from the Pusher 'searchresults' channel
    const leadsChannel = pusher.subscribe("searchresults");
    leadsChannel.bind("new-results", function (data: { results: any[] }) {
      setLeads((prevLeads) => [...prevLeads, ...data.results]);
    });

    return () => {
      scrapeChannel.unbind_all();
      scrapeChannel.unsubscribe();
      leadsChannel.unbind_all();
      leadsChannel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setProfilePicture(user?.imageUrl || "");
  }, [user]);

  const [formData, setFormData] = useState<FormData>({
    profileUrl: "",
    location: "",
    company: "",
    jobTitle: "",
    industry: "",
    followingCompany: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

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
    setElapsedTime(0);

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
        setScrapedData(data.content);
        setSuccess("Scraping successful!");
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
    <div className="h-[100vh] relative w-full bg-gradient-to-br bg-gray-900 flex gap-3 p-4">
      <div className="flex w-3/6 flex-col gap-4">
        <div className="flex flex-row justify-between">
          <div className="text-2xl text-white font-bold flex items-center gap-2 whitespace-nowrap p-3">
            <div className=" object-cover flex w-12 ">
              <div className="w-full flex  items-center ">
                <Dialog>
                  <DialogTrigger>
                    <div className="object-cover relative flex w-12 cursor-pointer">
                      <Image
                        src={profilePicture}
                        alt="profile"
                        width={100}
                        height={100}
                        style={{ borderRadius: "100%" }}
                      />
                      <div className="w-6 h-6 rounded-xl absolute -bottom-2 -right-2">
                        <Image
                          src="/SNIcon.jpg"
                          alt="profile"
                          width={100}
                          height={100}
                          style={{ borderRadius: "100%" }}
                        />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="bg-white">
                    <User />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <span className="ml-2">Connections</span>
          </div>
        </div>
        <Card className="bg-white w-full">
          <CardContent className="p-[1.2rem]">
            <AnimatePresence mode-wait>
              <Tabs defaultValue="form">
                <TabsList className="grid  grid-cols-2 mb-4">
                  <TabsTrigger value="form">New Search</TabsTrigger>
                  <TabsTrigger value="results">Searches</TabsTrigger>
                </TabsList>
                <TabsContent value="form">
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleScrape();
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Input
                          id="profileUrl"
                          name="profileUrl"
                          type="text"
                          value={formData.profileUrl}
                          onChange={handleInputChange}
                          placeholder="LinkedIn Profile URL"
                          className="w-full"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <Input
                            id="location"
                            name="location"
                            type="text"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="Location"
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Input
                            id="company"
                            name="company"
                            type="text"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="Company"
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Input
                            id="jobTitle"
                            name="jobTitle"
                            type="text"
                            value={formData.jobTitle}
                            onChange={handleInputChange}
                            placeholder="Current Job Title"
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2 ">
                          <Input
                            id="industry"
                            name="industry"
                            type="text"
                            value={formData.industry}
                            onChange={handleInputChange}
                            placeholder="Industry"
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          id="followingCompany"
                          name="followingCompany"
                          type="checkbox"
                          checked={formData.followingCompany}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label
                          htmlFor="followingCompany"
                          className="text-sm font-medium"
                        >
                          Following your company
                        </label>
                      </div>

                      <div className="w-full flex justify-end">
                        {isLoading ? (
                          <div className="mt-4 text-center w-full flex mx-auto justify-center">
                            <p className="relative text-sm flex gap-4 justify-between text-gray-500 ">
                              <span> Collecting data </span>{" "}
                              {formatTime(elapsedTime)}
                              <span className="flex items-center justify-center">
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                  <circle
                                    className="text-gray-300"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    fill="none"
                                    r="10"
                                    cx="12"
                                    cy="12"
                                  />
                                  <path
                                    className="text-primary"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    fill="none"
                                    d="M12 6 L12 12 L16 14"
                                  >
                                    <animateTransform
                                      attributeName="transform"
                                      attributeType="XML"
                                      type="rotate"
                                      dur="2s"
                                      from="0 12 12"
                                      to="360 12 12"
                                      repeatCount="indefinite"
                                    />
                                  </path>
                                </svg>
                              </span>
                            </p>
                          </div>
                        ) : (
                          <Button
                            type="submit"
                            disabled={isLoading || !formData.profileUrl}
                            className="relative shadow-none border rounded-[8px] border-gray-500 overflow-hidden"
                          >
                            <span className="flex items-center justify-center shadow-none">
                              <Search className="mr-2 w-4 h-4" />
                              Go
                            </span>
                          </Button>
                        )}
                      </div>
                    </form>
                  </motion.div>

                  {error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert variant="default" className="mt-4">
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
                <TabsContent value="results">
                  <Card className="w-full h-full bg-white overflow-y-scroll">
                    <CardContent className="p-[1.2rem]">
                      <Leads leads={leads} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </AnimatePresence>
          </CardContent>
        </Card>
        <Card className=" pt-0 overflow-y-scroll bg-white w-full h-[100%]">
          <CardContent className=" px-[1.2rem] ">
            <Logs logs={logs} />
          </CardContent>
        </Card>
      </div>
      <Card className="w-full h-full bg-white overflow-y-scroll">
        <CardContent className="p-[1.2rem]">
          <Searches scrapedData={[]} />
        </CardContent>
      </Card>
    </div>
  );
}
