import { useEffect, useState } from "react";
import { Avatar, Button, Flex, Form, Input, List, message, Select } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";
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
      message.success("Đã vào phòng chat");
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
      <div style={{ overflow: "auto" }}>
        

        {messages.length > 0 && <div style={{display:'flex',justifyContent:"center"}}>
          {/* <div className="menu">
            <a href="#" className="back">
              <i className="fa fa-angle-left" />{" "}
              <img src="https://i.imgur.com/G4EjwqQ.jpg" draggable="false" />
            </a>
            <div className="name">Random chat</div>
            <div className="members">
              <b>You</b>, Marga, Charo &amp; Brotons
            </div>
          </div> */}
          <ol className="chat">
            {messages.map((item)=>(
               <li className="other">
               <div className="msg">
                 <div className="user">
                   {item.user}
                 </div>
                 <p>
                  {item.message} 
                 </p>
                 <time>20:17</time>
               </div>
             </li>
            ))}
            
            
          </ol>
          
        </div>}
      </div>
      <div className="formchat">
        {!chatRoom ? (
          <>
            <Form
              name="joinRoom"
              layout="vertical"
              style={{ width: 300 }}
              initialValues={{ remember: true }}
              onFinish={joinChatRoom}
              autoComplete="off"
            >
              <div style={{ textAlign: "center" }}>
                <img
                  src="https://baoanjsc.com.vn/img/LOGO_BAOANJSC-Trang-KoSlogan.png"
                  alt=""
                />
              </div>
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
                rules={[{ required: true, message: "Vui lòng chọn phòng!" }]}
              >
                <Select>
                  <Select.Option value="room1">Room 1</Select.Option>
                  <Select.Option value="room2">Room 2</Select.Option>
                  <Select.Option value="room3">Room 3</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item style={{ textAlign: "center" }}>
                <Button type="primary" htmlType="submit">
                  Tham gia
                </Button>
              </Form.Item>
            </Form>
          </>
        ) : (
          <>
            <Form
              name="basic"
              layout="vertical"
              form={form}
              onFinish={onFinish}
              autoComplete="off"
            >
              <Flex align="center" i>
                <Form.Item
                  style={{ width: 400 }}
                  // label="Nội dung"
                  name="message"
                  rules={[
                    { required: true, message: "Vui lòng nhập nội dung" },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="large size"
                    // suffix={<ArrowUpOutlined />}
                  />
                </Form.Item>
                <Form.Item>
                  <Button size="large" type="primary" htmlType="submit">
                    Gửi <ArrowUpOutlined style={{ marginLeft: 8 }} />
                  </Button>
                </Form.Item>
              </Flex>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
