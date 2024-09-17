import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
} from "lucide-react";

type Lead = {
  name: string;

  company?: string;
};

export default function Leads({ leads }: { leads?: Lead[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("");

  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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
              placeholder="Filter by industry..."
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
      <div className="rounded-md ">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="w-[250px]">Name</TableHead>

              <TableHead>Company</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads?.map((profile, index) => (
              <TableRow
                key={profile.name}
                className={
                  index !== leads.length - 1
                    ? "border-b border-gray-200"
                    : ""
                }
              >
                 <TableCell>
                  <div className="flex items-center space-x-1">
                    <span>{profile.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <span>{profile.company}</span>
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
