"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  simulationName: z
    .string()
    .min(8, {
      message: "Simulation Name must be at least 8 characters",
    })
    .max(30, {
      message: "Simulation Name must be less than 30 characters",
    })
    .regex(/^[a-zA-Z0-9\s]+$/, {
      message: "Simulation Name must be alphanumeric",
    }),
});

type CreateNewSimulationProps = {
  onCreateNewSimulation: (values: z.infer<typeof formSchema>) => void;
};

export const CreateNewSimulation = ({
  onCreateNewSimulation,
}: CreateNewSimulationProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      simulationName: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onCreateNewSimulation(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-row gap-4">
          <FormField
            control={form.control}
            name="simulationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name of the simulation</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Paris 2023" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="relative top-[31px]" type="submit">
            Start new simuation
          </Button>
        </div>
      </form>
    </Form>
  );
};
