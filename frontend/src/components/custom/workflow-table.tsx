import { useState } from "react";
import { Workflow } from "@/types";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// icons
import { Eye, Plus, Trash } from "lucide-react";

// actions
import { deleteWorkflow } from "@/lib/actions/workflow.action";

// components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "./delete-dialog";
import { Button } from "@/components/ui/button";

interface WorkflowTableProps {
  workflows: Workflow[];
  setWorkflows: React.Dispatch<React.SetStateAction<Workflow[]>>;
  onViewWorkflow: (id: string) => void;
  loading: Boolean;
}

export const WorkflowTable: React.FC<WorkflowTableProps> = ({
  workflows,
  setWorkflows,
  onViewWorkflow,
  loading,
}) => {
  const router = useRouter();
  const { user } = useUser();
  const [workflowId, setWorkflowId] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleCreateWorkflow = () => {
    router.push("/workflows/create");
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await deleteWorkflow(id, user?.id || "");
      if (!response.status) {
        throw new Error("Error creating workflow");
      }
      const currentWorkflows = workflows.filter((item) => item.id !== id);
      setWorkflows(currentWorkflows);
      setOpenDialog(false);
    } catch (err: any) {
      console.log("Error: ", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Trigger</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">View</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-28" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-16 ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : workflows.length > 0 ? (
            workflows.map((workflow) => (
              <TableRow key={workflow.id}>
                <TableCell className="w-[200px]">{workflow.name}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    {workflow.trigger.type.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {workflow.actions.map((action, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                      >
                        {action.type.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{formatDate(workflow.timestamp)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewWorkflow(workflow.id)}
                    className="hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setOpenDialog(true);
                      setWorkflowId(workflow.id);
                    }}
                    className="hover:bg-red-100"
                  >
                    <Trash className="text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center space-y-4 py-10">
                <div className="text-gray-500">
                  No workflows yet. Create your first workflow to get started!
                </div>
                <Button
                  className="bg-[#FF7801] text-white hover:bg-[#FF7801]/90"
                  onClick={handleCreateWorkflow}
                >
                  <Plus className="mr-2 h-4 w-4" /> Create Your First Workflow
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DeleteDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        onDelete={() => handleDelete(workflowId)}
        isLoading={isDeleting}
        title="Delete Workflow"
        description="Are you sure you want to delete this workflow? All associated data will be permanently removed."
      />
    </div>
  );
};
