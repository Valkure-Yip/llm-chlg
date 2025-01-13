import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  origin: z.string().min(1, { message: "Starting location is required" }),
  destination: z.string().min(1, { message: "Drop-off point is required" }),
});

const InputForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      origin: "",
      destination: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem className="my-4">
                <FormLabel>Starting Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter starting location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem className="my-4">
                <FormLabel>Drop-off Point</FormLabel>
                <FormControl>
                  <Input placeholder="Enter drop-off point" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center items-center gap-2 my-4">
            <Button type="submit">Submit</Button>
            <Button type="button" onClick={() => form.reset()}>Reset</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default InputForm
