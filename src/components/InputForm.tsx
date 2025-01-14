import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { mockRequestAndGetRouteStatus } from "@/api/mock";
import { requestAndGetRouteStatus, RouteStatus } from "@/api";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  origin: z.string().min(1, { message: "Starting location is required" }),
  destination: z.string().min(1, { message: "Drop-off point is required" }),
});

interface InputFormProps {
  routeStatus: RouteStatus | null;
  onFinish: (status: RouteStatus | null) => void;
  onReset: () => void;
}

const InputForm = ({ routeStatus, onFinish, onReset }: InputFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      origin: "",
      destination: "",
    },
    resolver: zodResolver(formSchema),
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: { origin: string, destination: string }) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const status = import.meta.env.VITE_USE_MOCK ? await mockRequestAndGetRouteStatus(data.origin, data.destination, 'success', 'success')
        : await requestAndGetRouteStatus(data.origin, data.destination);
      onFinish(status);
      setErrorMessage(null);
    } catch (error) {
      onFinish(null);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    form.reset();
    onReset();
    setErrorMessage(null);
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
                  <Input type="search" placeholder="Enter starting location" {...field}
                    autoComplete="origin"
                  />
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
                  <Input type="search" placeholder="Enter drop-off point" {...field}
                    autoComplete="destination" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="my-4 h-32 flex flex-col justify-end">
            {
              routeStatus?.status === 'success' && <div>
                <p>total distance: {routeStatus.total_distance}</p>
                <p>total time: {routeStatus.total_time}</p>
              </div>
            }
            {
              errorMessage && <div>
                <p className="text-red-500">{errorMessage}</p>
              </div>
            }

          </div>
          <div className="flex justify-center items-center gap-2 my-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : null}
              Submit
            </Button>
            <Button type="button" onClick={handleReset}>Reset</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default InputForm
