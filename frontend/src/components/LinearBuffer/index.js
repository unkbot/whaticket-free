import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles({
  root: {
    width: '100%',
    marginTop: '1rem',
  },
});

export default function LinearDeterminate({progressMessage}) {
  const classes = useStyles();
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    setProgress(progressMessage);
  }, [progressMessage]);

  return (
    <div className={classes.root}>
      <LinearProgress variant="determinate" value={progress} />
    </div>
  );
}