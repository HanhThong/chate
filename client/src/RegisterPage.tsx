import React from 'react';
import { Link, useHistory} from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import * as service from './services';


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
  key: {
    margin: theme.spacing(2, 0, 1),
  },
  submit: {
    margin: theme.spacing(1, 0, 1),
  },
}));

export const Alert = (props: any) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function RegisterPage() {
  const classes = useStyles();
  const history = useHistory();

  const [fullName, setFullName] = React.useState('');
  const [userName, setUserName] = React.useState('');
  const [publicKey, setPublicKey] = React.useState<File>();

  const [isOpenSuccess, setIsOpenSuccess] = React.useState(false);
  const [isOpenFailed, setIsOpenFailed] = React.useState(false);

  const register = () => {
    const payload = new FormData();
    payload.append('fullName', fullName);
    payload.append('userName', userName);
    payload.append('publicKey', publicKey, publicKey.name);

    service.register(payload)
      .then((response) => {
        setIsOpenSuccess(true);
      })
      .catch((error) => {
        setIsOpenFailed(true);
      });
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Snackbar open={isOpenSuccess} autoHideDuration={3000} onClose={() => history.push('/')} children={
        <Alert onClose={() => setIsOpenSuccess(false)} severity="success">
          Register successfull
        </Alert>
      }/>

      <Snackbar open={isOpenFailed} autoHideDuration={3000} onClose={() => setIsOpenFailed(false)} children={
        <Alert onClose={() => setIsOpenFailed(false)} severity="error">
          Register failed. Please check your data.
        </Alert>
      }/>

      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Register Page
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="fullName"
            label="Full name"
            name="fullName"
            autoComplete="fullName"
            onChange={event => setFullName(event.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="userName"
            label="User name"
            name="userName"
            autoComplete="userName"
            onChange={event => setUserName(event.target.value)}
          />
          <Button
            className={classes.key}
            variant="outlined"
            component="label"
            fullWidth
            size="large"
          >
            Select Public Key
            <input type="file" onChange={event => setPublicKey(event.target.files[0])} hidden></input>
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={register}
          >
            Register
          </Button>
          <Grid container alignContent="center" justify="center">
            <Grid item>
              <Link to='/'>
                <Typography variant="body2">
                  {"Back to Login"}
                </Typography>
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}
