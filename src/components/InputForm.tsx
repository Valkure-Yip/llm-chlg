import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  startingLocation: z.string().min(1, { message: "Starting location is required" }),
  dropOffPoint: z.string().min(1, { message: "Drop-off point is required" }),
});

const InputForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      startingLocation: "",
      dropOffPoint: "",
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
            name="startingLocation"
            render={({ field }) => (
              <FormItem className="my-4">
                <FormLabel>Starting Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter starting location" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dropOffPoint"
            render={({ field }) => (
              <FormItem className="my-4">
                <FormLabel>Drop-off Point</FormLabel>
                <FormControl>
                  <Input placeholder="Enter drop-off point" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex justify-center items-center gap-2">
            <Button type="submit">Submit</Button>
            <Button type="button" onClick={() => form.reset()}>Reset</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default InputForm
