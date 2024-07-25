import { useEffect, useState } from "react";
import { Avatar, Button, Form, Input, List, Select } from "antd";
import "./App.css";
import * as signalR from "@microsoft/signalr";

function App() {
  const [form] = Form.useForm();
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);
  const [chatRoom, setChatRoom] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const connect = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5093/chat")
      .withAutomaticReconnect()
      .build();

    connect
      .start()
      .then(() => {
        console.log("Connected!");
        setConnection(connect);
      })
      .catch((err) => console.log("Connection failed: ", err));

    return () => {
      connect.stop();
    };
  }, []);

  const joinChatRoom = async (values) => {
    const room = values.chatRoom;
    const username = values.user;

    if (connection) {
      await connection.send("JoinChatRoom", {
        Username: username,
        ChatRoom: room,
      });
      setChatRoom(room);
      setUser(username);

      connection.on("ReceiveMessage", (user, message) => {
        console.log("Message received:", { user, message });
        setMessages((prevMessages) => [...prevMessages, { user, message }]);
      });
    }
  };

  const onFinish = async (values) => {
    const message = values.message;
    if (connection && chatRoom) {
      await connection.send("SendMessageToRoom", chatRoom, user, message);
    }
  };

  return (
    <div className="chatbox">
      <h1>Realtime Chat Nguyễn Bùi Tùng</h1>
      <div className="formchat">
        {!chatRoom ? (
          <Form
            name="joinRoom"
               layout="vertical"
            style={{ width: 300 }}
            initialValues={{ remember: true }}
            onFinish={joinChatRoom}
            autoComplete="off"
          >
            <Form.Item
              label="Tên người dùng"
              name="user"
              rules={[
                { required: true, message: "Vui lòng nhập tên của bạn!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Phòng"
              name="chatRoom"
              rules={[
                { required: true, message: "Vui lòng chọn phòng!" },
              ]}
            >
              <Select>
                <Select.Option value="room1">Room 1</Select.Option>
                <Select.Option value="room2">Room 2</Select.Option>
                <Select.Option value="room3">Room 3</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item style={{textAlign:"center"}}>
              <Button type="primary" htmlType="submit">
                Tham gia
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <>
            <Form
              name="basic"
              layout="vertical"
              form={form}
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                label="Nội dung"
                name="message"
                rules={[
                  { required: true, message: "Vui lòng nhập nội dung" },
                ]}
              >
                <Input.TextArea />
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                  Send
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </div>
      <List
        itemLayout="horizontal"
        dataSource={messages}
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar
                  src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`}
                />
              }
              title={item.user}
              description={item.message}
            />
          </List.Item>
        )}
      />
    </div>
  );
}

export default App;
