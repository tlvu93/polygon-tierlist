"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PolyList } from "../../types";

interface TableViewProps {
  polyLists: PolyList[];
  currentPolyList: PolyList | undefined;
}

export function TableView({ polyLists, currentPolyList }: TableViewProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          {currentPolyList?.stats.map((stat, index) => (
            <TableHead key={index}>{stat.name}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {polyLists.map((polyList) => (
          <TableRow key={polyList.id}>
            <TableCell>{polyList.name}</TableCell>
            {polyList.stats.map((stat, index) => (
              <TableCell key={index}>{stat.value}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
