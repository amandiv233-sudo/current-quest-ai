import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

const fetchBookmarkIds = async (userId: string) => {
  const { data, error } = await supabase
    .from("bookmarked_mcqs")
    .select("mcq_id")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
  // Return a Set for efficient O(1) lookups
  return new Set(data.map((b) => b.mcq_id));
};

export const useBookmarks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryKey = ["bookmarks", user?.id];

  const { data: bookmarkedIds, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchBookmarkIds(user!.id),
    enabled: !!user, // Only fetch if the user is logged in
  });

  const addBookmarkMutation = useMutation({
    mutationFn: async (mcqId: string) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from("bookmarked_mcqs")
        .insert({ user_id: user.id, mcq_id: mcqId });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      // Refetch the bookmarks list after a successful addition
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Bookmark Added", description: "Question saved for review." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: async (mcqId: string) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from("bookmarked_mcqs")
        .delete()
        .eq("user_id", user.id)
        .eq("mcq_id", mcqId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      // Refetch the bookmarks list after a successful removal
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Bookmark Removed" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const isBookmarked = (mcqId: string) => {
    return bookmarkedIds?.has(mcqId) ?? false;
  };

  return {
    isLoading,
    isBookmarked,
    addBookmark: addBookmarkMutation.mutate,
    removeBookmark: removeBookmarkMutation.mutate,
  };
};