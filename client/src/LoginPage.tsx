import React from 'react';
import { ipcRenderer } from 'electron';
import fs from 'fs';
import crypto from 'crypto';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import { Link as RouterLink, useHistory } from 'react-router-dom';
import { useUserName, usePrivateKeyPath } from './hooks';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(1, 0, 1),
  },
}));

export const Alert = (props: any) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function SignIn() {
  const classes = useStyles();
  const history = useHistory();

  const { userName, setUserName } = useUserName();
  const { privateKeyPath, setPrivateKeyPath } = usePrivateKeyPath();
  const [pkPath, setPkPath] = React.useState('');
  const [isShowLoginFailed, setIsShowLoginFailed] = React.useState(false);
  const [fUpdate, setFUpdate] = React.useState(0);

  React.useMemo(() => {
    ipcRenderer.on('loginWebSocketSuccess', (event, args) => {
      history.push('/chat');
    });

    ipcRenderer.on('loginWebSocketFailed', (event, args) => {
      console.log('Error');
      setIsShowLoginFailed(true);
    });

    ipcRenderer.on('connectionDisconnected', (event, args) => {
      history.push('/');
    });

    localStorage.clear();
  }, []);

  const login = async () => {
    console.log(pkPath);
    
    const privateKey = await fs.promises.readFile(pkPath, 'utf-8');
    const payload = {
      userName,
      timestamp: new Date(),
    }

    const encryptedPayload = crypto.privateEncrypt(privateKey, Buffer.from(JSON.stringify(payload)));
    ipcRenderer.send('loginWebSocket', { userName, accessToken: encryptedPayload.toString('base64') });
    setPrivateKeyPath(pkPath);

    setTimeout(() => setIsShowLoginFailed(true), 3000);
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />

      <Snackbar open={isShowLoginFailed} autoHideDuration={3000} onClose={() => setIsShowLoginFailed(false)} children={
        <Alert onClose={() => setIsShowLoginFailed(false)} severity="error">
          Login infomation is not correct
        </Alert>
      }/>

      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="userName"
            label="User Name"
            name="userName"
            autoComplete="userName"
            autoFocus
            onChange={event => setUserName(event.target.value)}
          />
          <Button
            variant="outlined"
            component="label"
            fullWidth
            size="large"
          >
            Select Private Key
            <input type="file" hidden onChange={event => {
              console.log(event.target.files[0]);
              setPkPath(event.target.files[0]!.path);
            }} />
          </Button>
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={login}
          >
            Sign In
          </Button>
          <Grid container alignContent="center" justify="center">
            <Grid item>
              <RouterLink to="/register" replace>
                <Typography variant="body2">
                  {"Don't have an account? Sign Up"}
                </Typography>
              </RouterLink>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}