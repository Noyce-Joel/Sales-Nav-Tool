import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Linkedin, Mail, Search, Filter } from 'lucide-react'

type Profile = {
  id: string
  name: string
  linkedinUrl: string
  jobTitle: string
  company: string
  location: string
  industry: string
  email: string
  connections: number
  imageUrl: string
}

export default function Searches({ scrapedData }: { scrapedData?: Profile[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('')

  const filteredData = scrapedData?.filter((profile) => {
    const searchLower = searchTerm.toLowerCase()
    const filterLower = filter.toLowerCase()
    return (
      profile.name.toLowerCase().includes(searchLower) &&
      (filterLower === '' || profile.industry.toLowerCase().includes(filterLower))
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Watch List</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="relative">
            <Input
              type="text"
              placeholder="Filter by industry..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10"
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      </div>
      <div className="rounded-md ">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Connections</TableHead>
             
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData?.map((profile, index) => (
              <TableRow 
                key={profile.id} 
                className={index !== filteredData.length - 1 ? "border-b border-gray-200" : ""}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.imageUrl} alt={profile.name} />
                      <AvatarFallback>{profile.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span>{profile.name}</span>
                  </div>
                </TableCell>
                <TableCell>{profile.jobTitle}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <span>{profile.company}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <span>{profile.location}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{profile.industry}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center -ml-2 justify-center">
                    <Mail size={15} />
                    <span>{profile.email}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{profile.connections}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="mr-2 h-4 w-4" />
                      View Profile
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}