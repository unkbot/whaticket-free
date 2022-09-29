import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    height: 240,
    width: 240,
  },
  control: {
    padding: theme.spacing(2),
  },
}));

export default function SpacingGrid({ message }) {
  const classes = useStyles();

  return (
    <Grid container className={classes.root} spacing={2}  style={{
      marginTop: "20px",
    }}>
      <Grid item xs={12}>
        <Grid container justifyContent="center" spacing={2}>
          {message.map((value) => (
            <Grid key={value.phone} item>
              <Paper className={classes.paper}>
                
                <Typography variant="body2" component="p">
                  {value.phone}
                </Typography>

                <Typography variant="body2" component="p">
                  {value.message}
                </Typography>
                </Paper>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}
