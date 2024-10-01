"use client";

import React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { formatTime } from "@/lib/utils/mainUtils";
import { Button } from "@/components/ui/button";
import {
  Search,
  Briefcase,
  MapPin,
  Building,
  Cookie,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

export type NewSearchProps = {
  handleScrape: () => void;
  formData: {
    profileUrl: string;
    location: string;
    company: string;
    title: string;
    sessionCookie: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  elapsedTime: number;
  error: string;
  success: string;
};

export default function Component({
  handleScrape,
  formData,
  handleInputChange,
  isLoading,
  elapsedTime,
  error,
  success,
}: NewSearchProps) {
  return (
    <Card className="w-full shadow-none border-0 p-0 max-w-2xl mx-auto">
      <CardContent className="p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScrape();
            }}
            className="space-y-3"
          >
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="profileUrl"
                  name="profileUrl"
                  type="text"
                  value={formData.profileUrl}
                  onChange={handleInputChange}
                  placeholder="Sales Navigator URL"
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Location"
                    className="pl-10"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Company"
                    className="pl-10"
                  />
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Job Title"
                    className="pl-10"
                  />
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="sessionCookie"
                  name="sessionCookie"
                  type="text"
                  value={formData.sessionCookie}
                  onChange={handleInputChange}
                  placeholder="cookie"
                  className="pl-10"
                />
                <Cookie className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            <div className="w-full flex justify-end">
              {isLoading ? (
                <div className="mt-4 text-center w-full flex mx-auto justify-center">
                  <p className="relative text-sm flex gap-4 justify-between text-foreground items-center">
                    <span>Collecting data</span> {formatTime(elapsedTime)}
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </span>
                  </p>
                </div>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading || !formData.profileUrl}
                  className="relative border rounded-xl transition-shadow duration-300"
                >
                  <span className="flex items-center justify-center">
                    <Search className="mr-2 w-4 h-4" />
                    Start Search
                  </span>
                </Button>
              )}
            </div>
          </form>
        </motion.div>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert
            variant="default"
            className="mt-6 bg-green-50 border-green-200 text-green-800"
          >
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
