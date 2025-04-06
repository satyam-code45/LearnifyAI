"use client";
import { CoachingOptions } from "@/utils/Options";
import { Button } from "../ui/button";
import { useUser } from "@stackframe/stack";
import { Card, CardContent, CardFooter } from "../ui/card";
import Image from "next/image";
import { BlurFade } from "../magicui/blur-fade";
import UserInputDilaog from "./UserInputDilaog";
import ProfileDialog from "./ProfileDialog";

const FeatureAssistants = () => {
  const user = useUser();
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-xl text-muted-foreground">
            My Workspace
          </p>
          <span className="text-2xl font-bold">
            Welcome Back,{" "}
            <span className="text-3xl font-bold text-primary">
              {user?.displayName}
            </span>
          </span>
        </div>
        <div>
          <ProfileDialog>
            <Button className="font-bold w-full">Profile</Button>
          </ProfileDialog>
        </div>
      </div>
      <div className="grid md:grid-cols-3 lg:grid-cols-5 justify-center items-center gap-6 mt-8 p-6">
        {CoachingOptions.map((item, idx) => (
          <UserInputDilaog key={item.name} CoachingOption={item.name}>
            <Card className="flex items-center justify-center">
              <BlurFade delay={0.25 + idx * 0.05} inView>
                <CardContent>
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="h-48 w-48 hover:rotate-8 p-9 cursor-pointer transition-all duration-300"
                  />
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="font-bold text-lg text-center ">{item.name}</p>
                </CardFooter>
              </BlurFade>
            </Card>
          </UserInputDilaog>
        ))}
      </div>
    </div>
  );
};

export default FeatureAssistants;
