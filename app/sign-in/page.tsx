import React from "react";
import SignIn from "@/components/sign-in";
import { redirect } from "next/navigation";
import { getToken } from "@/lib/auth-server";

const page = async () => {
  const token = await getToken();
  if (token) {
    redirect("/app");
  }
  return (
    <div className="flex justify-center items-center min-h-screen w-full">
      <SignIn />
    </div>
  );
};

export default page;
