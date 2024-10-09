'use client'

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Connection } from "@/lib/types";
import Image from "next/image";

import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function Connections({
  profiles,
}: {
  profiles?: Connection[] | null;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("");

  const filteredProfiles = useMemo(() => {
    if (!profiles) return [];

    return profiles.filter((connection) => {
      const matchesSearch = 
        connection.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        connection.leadId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        connection.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        connection.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        connection.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = 
        filter === "" || 
        connection.company?.toLowerCase().includes(filter.toLowerCase());

      return matchesSearch && matchesFilter;
    });
  }, [profiles, searchTerm, filter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">
          Recent Connections {filteredProfiles.length}
        </h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
          <div className="relative">
            <Input
              type="text"
              placeholder="Filter by company..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10"
            />
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>
      </div>
      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 transition-none">
              <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead className="overflow-hidden">Company</TableHead>
              <TableHead className="overflow-hidden">Title</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="transition-none">
            {filteredProfiles.map((connection, index) => (
              <TableRow
                key={index}
                className={
                  index !== filteredProfiles.length - 1
                    ? "border-b border-gray-200"
                    : ""
                }
              >
                <TableCell className="text-center h-12 py-4">
                  <div className="flex justify-center items-center h-12 w-12">
                    {connection.picture && (
                      <Image
                        src={`${connection.picture}`}
                        alt={connection.name || "No name available"}
                        height={100}
                        width={100}
                        className="rounded-full"
                      />
                    )}
                  </div>
                </TableCell>
                
                <TableCell className="font-medium">
                  <div className="flex items-center justify-start space-x-3 relative">
                    <Link
                      href={connection?.linkedinUrl || ""}
                      target="_blank"
                      className="w-1/2 whitespace-nowrap"
                    >
                      {connection.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center justify-start space-x-3 relative">
                    {connection.leadId}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center justify-start space-x-3 relative">
                    <span className="whitespace-nowrap">
                      {connection.company}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center justify-start space-x-3 relative">
                    <span className="whitespace-nowrap">
                      {connection.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center justify-start space-x-3 relative">
                    <span className="whitespace-nowrap">
                      {connection.location}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
