import React from 'react'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
import Image from 'next/image'
import User from './User'
export default function UserButton({profilePicture}: {profilePicture: string}) {    
  return (
    <div className="text-2xl font-bold flex items-center gap-2 whitespace-nowrap p-3">
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
                  <DialogContent className="bg-[#1a4154]">
                    <User />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <span className="ml-2">Connect Navigator</span>
          </div>
  )
}
