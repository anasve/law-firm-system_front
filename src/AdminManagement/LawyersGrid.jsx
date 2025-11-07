import React from "react";
import { Grid } from "@mui/material";
import LawyerCard from "./LawyerCard";

export default function LawyersGrid({ lawyers, ...actions }) {
  return (
    <Grid container spacing={2}>
      {lawyers.map(lawyer => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={lawyer.id}>
          <LawyerCard lawyer={lawyer} {...actions} />
        </Grid>
      ))}
    </Grid>
  );
}