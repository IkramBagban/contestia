import { useContests, useLogout, useMe, useStartContest } from "@/hooks/use-queries";
import { Loader2, LogOut, Trophy, Calendar, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function DashboardPage() {
  const { data: contests, isLoading: isLoadingContests } = useContests();
  const { mutate: logout } = useLogout();
  const { data: user, isLoading: isLoadingUser } = useMe();
  const { mutate: startContest } = useStartContest();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success("Logged out successfully");
        navigate("/login");
      },
    });
  };

  const handleEnterContest = (contestId: string) => {
    startContest(contestId, {
        onSuccess: () => {
            navigate(`/contest/${contestId}/attempt`);
        },
        onError: (err: any) => {
            const msg = err.response?.data?.error || err.response?.data?.message || "Failed to start contest";
            toast.error(msg);
            
            if (msg.includes("started") || msg.includes("already submitted")) {
                 navigate(`/contest/${contestId}/attempt`);
            }
        }
    });
  }

  const isLoading = isLoadingContests || isLoadingUser;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">

            {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Trophy className="h-5 w-5" />
            </div> */}
            <img src="/logo.png" alt="Contestia" className="h-8 w-8 object-contain  " />
            <span className="text-xl font-bold tracking-tight text-gray-900">Contestia</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-sm font-medium text-gray-600 sm:block">
               {user?.email}
            </div>
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Available Contests</h1>
          <p className="mt-2 text-lg text-gray-600">Challenge yourself with these active competitions.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {contests?.map((contest: any) => {
            const startDate = new Date(contest.startDate).toLocaleDateString();
            const startTime = contest.startTime;
            
            return (
              <div
                key={contest.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-indigo-500/20"
              >
                <div>
                   <div className="mb-4 flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Active
                      </span>
                      <span className="text-xs text-gray-400">ID: {contest.id.slice(0,8)}</span>
                   </div>
                  <h3 className="text-xl font-semibold leading-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {contest.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500 line-clamp-3">
                    {contest.description}
                  </p>
                  
                  <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {startDate}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-gray-400" />
                       {startTime}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => handleEnterContest(contest.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 hover:shadow-indigo-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98]"
                  >
                    Enter Contest
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {(!contests || contests.length === 0) && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <Trophy className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No contests found</h3>
                <p className="mt-1 text-sm text-gray-500">Check back later for new challenges.</p>
            </div>
        )}
      </main>
    </div>
  );
}
