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
  const [fUpdate, setFUpdate] = React.useState(0);
  const [message, setMessage] = React.useState('');
  const [users, setUsers] = React.useState<any>([]);
  const { userName } = useUserName();
  const { privateKeyPath } = usePrivateKeyPath();
  const [privateKey, setPrivateKey] = React.useState<any>();
  const [targetUser, setTargetUser] = React.useState('');
  const [messageData, setMessageData] = React.useState<any>(JSON.parse(localStorage.getItem('messageData') || '{}'));

  React.useMemo(async () => {
    const allUser = await Services.getAllUser();
    setUsers(allUser);
  }, []);

  React.useMemo(async () => {
    const pk = await fs.promises.readFile(privateKeyPath);
    setPrivateKey(pk);
  }, [privateKeyPath]);

  React.useMemo(async () => {
    Services.downloadPublicKey(targetUser);
  }, [targetUser]);

  React.useMemo(() => {
    ipcRenderer.on('onMessage', async (event, message) => {
      const parsedMessage: any = JSON.parse(message);
      if (!Array.isArray(messageData[parsedMessage['fromUser']])) {
        messageData[parsedMessage['fromUser']] = [];
      }

      let key = parsedMessage['fromUser'];
      if (key == userName) {
        key = parsedMessage['toUser'];
      }

      if (!Array.isArray(messageData[key])) {
        messageData[key] = [];
      }

      messageData[key].push(parsedMessage);
      setMessageData({...messageData});
      localStorage.setItem('messageData',  JSON.stringify(messageData));
    })
  }, []);

  const sendMessage = async () => {
    const payload = { message, timestamp: new Date().toISOString() };
    const publicKey = await fs.promises.readFile(`${Services.publickKeyDir}/${targetUser}.pub`);
    const encryptedMessage = crypto.publicEncrypt(publicKey, Buffer.from(JSON.stringify(payload)));
    ipcRenderer.send('sendMessage', { fromUser: userName, toUser: targetUser, payload: encryptedMessage.toString('base64') });
    setMessage('');

    if (!Array.isArray(messageData[targetUser])) {
      messageData[targetUser] = [];
    }

    messageData[targetUser].push({ fromUser: userName, toUser: targetUser, payload });
    localStorage.setItem('messageData',  JSON.stringify(messageData));
    setMessageData({...messageData});
  }

  const getMessageInTab = () => messageData[targetUser] || [];

  const tabMessage = getMessageInTab().map((message: any) => {
    if (message.fromUser != userName) {
      const payload = message.payload;
      const decryptMessage = crypto.privateDecrypt(privateKey, Buffer.from(payload, 'base64'));
      return { ...message, payload: JSON.parse(decryptMessage.toString()) };
    }
    return message;
  })

  return (
    <div className={classes.root}>
      <Grid container spacing={3} style={{ height: 'calc(100vh - 20px)' }}>
        <Grid item xs={3}>
          <Paper className={classes.paper}>
            <MenuList>
              {users.map((user: any) => {
                if (user.userName !== userName) {
                  return (
                    <MenuItem key={user.userName} onClick={() => {
                      setTargetUser(user.userName);
                    }}>
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
            <List style={{ height: 'calc(100vh - 110px)', overflow: 'scroll'}}>
              {tabMessage.map((message: any) => {
                if (message.fromUser === userName) {
                  console.log(message);
                  return (
                    <ListItem alignItems="flex-start" key={message.payload.timestamp}>
                      <ListItemText
                        primary={message.payload.message}
                        secondary={
                          <React.Fragment>
                            {message.payload.timestamp}
                          </React.Fragment>
                        }
                        style={{ textAlign: 'right', paddingRight: 15 }}
                      />
                      <ListItemAvatar>
                        <Avatar alt={message.fromUser} src={`/static/images/avatar/${message.fromUser}`} />
                      </ListItemAvatar>
                    </ListItem>
                  )
                } else {
                  return (
                    <ListItem alignItems="flex-start" key={message.timestamp}>
                      <ListItemAvatar>
                        <Avatar alt={message.fromUser} src={`/static/images/avatar/${message.fromUser}`} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={message.payload.message}
                        secondary={
                          <React.Fragment>
                            {message.timestamp}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  )
                }
              })}
            </List>

            <FormControl variant="outlined" fullWidth style={{ position: 'absolute', bottom: 0, left: 0, padding: 10, width: 'calc(100% - 20px)' }}>
              <OutlinedInput
                id="text"
                value={message}
                onChange={event => {
                  setMessage(event.target.value);
                  setFUpdate(fUpdate + 1);
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    sendMessage();
                    setFUpdate(fUpdate + 1);
                  }
                }}
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