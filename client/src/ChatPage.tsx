import React from 'react';
import fs from 'fs';
import crypto from 'crypto';
import { ipcRenderer } from 'electron';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import SendIcon from '@material-ui/icons/Send';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import OutlinedInput from '@material-ui/core/OutlinedInput';

import { useUserName, usePrivateKeyPath } from './hooks';
import * as Services from './services';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      height: '100%',
    },
    inline: {
      display: 'inline',
    },
  }),
);

export const ChatPage = () => {
  const classes = useStyles();
  const [message, setMessage] = React.useState('');
  const [users, setUsers] = React.useState<any>([]);
  const { userName } = useUserName();
  const { privateKeyPath } = usePrivateKeyPath();
  const [targetUser, setTargetUser] = React.useState('');

  React.useMemo(async () => {
    const allUser = await Services.getAllUser();
    setUsers(allUser);
    console.log(allUser);
  }, []);

  React.useMemo(() => {
    ipcRenderer.on('onMessage', (message) => {
      console.log(message);
    })
  }, []);

  const sendMessage = async () => {
    const payload = { message, timestamp: new Date() };
    const privateKey = await fs.promises.readFile(privateKeyPath);
    const encryptedMessage = crypto.privateEncrypt(privateKey, Buffer.from(JSON.stringify(payload)));
    ipcRenderer.send('sendMessage', { fromUser: userName, toUser: 'Test', payload: encryptedMessage.toString() });
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={3} style={{ height: 'calc(100vh - 20px)' }}>
        <Grid item xs={3}>
          <Paper className={classes.paper}>
            <MenuList>
              {users.map((user: any) => {
                if (user.userName !== userName) {
                  return (
                    <MenuItem key={user.username} onClick={() => setTargetUser(user.username)}>
                      <ListItemIcon>
                        <AccountBoxIcon fontSize="large" />
                      </ListItemIcon>
                      <Typography variant="inherit">{user.fullName}</Typography>
                    </MenuItem>
                  )
                }
              })}
            </MenuList>
          </Paper>
        </Grid>
        <Grid item xs={9}>
          <Paper className={classes.paper} style={{ display: 'block', position: 'relative' }}>
            <List>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar alt="Hanh Thong" src="/static/images/avatar/1.jpg" />
                </ListItemAvatar>
                <ListItemText
                  primary="Brunch this weekend?"
                  secondary={
                    <React.Fragment>
                      10:00 24-01-2021
                    </React.Fragment>
                  }
                />
              </ListItem>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary="Brunch this weekend?"
                  secondary={
                    <React.Fragment>
                      10:00 24-01-2021
                    </React.Fragment>
                  }
                  style={{ textAlign: 'right', paddingRight: 15 }}
                />
                <ListItemAvatar>
                  <Avatar alt="Hanh Thong" src="/static/images/avatar/1.jpg" />
                </ListItemAvatar>
              </ListItem>

              <ListItem alignItems="flex-start">
                <ListItemText
                  primary="Brunch this weekend?"
                  secondary={
                    <React.Fragment>
                      10:00 24-01-2021
                    </React.Fragment>
                  }
                  style={{ textAlign: 'right', paddingRight: 15 }}
                />
                <ListItemAvatar>
                  <Avatar alt="Hanh Thong" src="/static/images/avatar/1.jpg" />
                </ListItemAvatar>
              </ListItem>

              <ListItem alignItems="flex-start">
                <ListItemText
                  primary="Brunch this weekend?"
                  secondary={
                    <React.Fragment>
                      10:00 24-01-2021
                    </React.Fragment>
                  }
                  style={{ textAlign: 'right', paddingRight: 15 }}
                />
                <ListItemAvatar>
                  <Avatar alt="Hanh Thong" src="/static/images/avatar/1.jpg" />
                </ListItemAvatar>
              </ListItem>
            </List>

            <FormControl variant="outlined" fullWidth style={{ position: 'absolute', bottom: 0, left: 0, padding: 10, width: 'calc(100% - 20px)' }}>
              <OutlinedInput
                id="text"
                onChange={event => setMessage(event.target.value)}
                onKeyDown={event => event.key === 'Enter' && sendMessage()}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      edge="end"
                    >
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          </Paper>
        </Grid>
      </Grid>
    </div >
  )
}