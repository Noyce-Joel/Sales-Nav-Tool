import React, { useState } from "react";
import { DialogHeader } from "../ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Input } from "../ui/input";
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
