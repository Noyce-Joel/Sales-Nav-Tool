import React, { useEffect, useState } from "react";
import { Dialog, DialogHeader, DialogTrigger } from "../ui/dialog";
import Image from "next/image";
import { LinkedinIcon } from "lucide-react";
import { DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Input } from "../ui/input";
import { useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";



export default function User() {
  
  const [linkedInCredentials, setLinkedInCredentials] = useState({
    username: "",
    password: "",
  });
  

  

  const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLinkedInCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("LinkedIn credentials submitted:", linkedInCredentials);
  };
  return (
    
     <>
        <DialogHeader>
          <DialogTitle>Enter LinkedIn Credentials</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <Input
            name="username"
            type="text"
            placeholder="LinkedIn Username"
            value={linkedInCredentials.username}
            onChange={handleCredentialsChange}
          />
          <Input
            name="password"
            type="password"
            placeholder="LinkedIn Password"
            value={linkedInCredentials.password}
            onChange={handleCredentialsChange}
          />
          <Button type="submit">Submit</Button>
        </form>
     
        </>
  );
}
