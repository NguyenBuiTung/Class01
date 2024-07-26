import { useEffect, useState } from "react";
import { Button, Flex, Form, Input, message, Select, Tooltip } from "antd";
import { LogoutOutlined, RightCircleOutlined } from "@ant-design/icons";
import "./App.css";
import * as signalR from "@microsoft/signalr";
import InputEmoji from "react-input-emoji";
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
      // Add the event listener for ReceiveMessage only once
      connection.off("ReceiveMessage"); // Remove any previously added listeners
      connection.on("ReceiveMessage", (user, mess, timestamp) => {
        if (mess === "Tên người dùng đã tồn tại") {
          message.error("Tên người dùng đã tồn tại");
          return;
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { user, mess, timestamp },
          ]);
          // Update the chat room and user if the join was successful
          setChatRoom(room);
          setUser(username);
        }
      });
      // message.success("Đã vào phòng chat");
      // Send the join request
      await connection.send("JoinChatRoom", {
        Username: username,
        ChatRoom: room,
      });
    }
  };
  const [textChat, setTextChat] = useState("");
  console.log(textChat)
  const onFinish = async () => {
    if (connection && chatRoom) {
      await connection.send("SendMessageToRoom", chatRoom, user, textChat);
    }
    setTextChat("");
  };
  const leaveChatRoom = async () => {
    if (connection && chatRoom && user) {
      await connection.send("LeaveChatRoom", chatRoom, user);
      setChatRoom("");
      setUser("");
      setMessages([]);
      message.success("Bạn đã rời phòng chat.");
    }
  };
  // Add the event listener for page unload
  useEffect(() => {
    const handleBeforeUnload = async (event) => {
      await leaveChatRoom();
      event.preventDefault(); // For some browsers to show a confirmation dialog
      event.returnValue = ""; // For some browsers to show a confirmation dialog
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [connection, chatRoom, user]);
  const [backgroundImage, setBackgroundImage] = useState("");

  const handleChangeBg = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(`url(${reader.result})`);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div
      className="chatbox"
      style={{
        backgroundImage: backgroundImage,
        backgroundSize: "cover",
        height: "100vh",
      }}
    >
      <h1>Realtime ChatRoom Class01</h1>
      <Button
        style={{ margin: "0 auto" }}
        type="primary"
        onClick={() => document.getElementById("bgInput").click()}
      >
        Thay hình nền
      </Button>
      <input
        type="file"
        id="bgInput"
        style={{ display: "none" }}
        onChange={handleChangeBg}
        accept="image/*"
      />

      <div style={{ overflow: "auto" }}>
        {chatRoom && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ol className="chat">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className="message"
                  style={{
                    color: msg.user === "#000",
                    alignSelf: msg.user === user ? "flex-end" : "flex-start",
                    backgroundColor: msg.user === user ? "#69c0ff" : "#f0f0f0",
                    borderRadius: "10px",
                    padding: "10px",
                    margin: "5px",
                    width: msg.user === "Thông báo" ? "100%" : "40%",
                    wordWrap: "break-word",
                  }}
                >
                  <strong>{msg.user}</strong>: {msg.mess}
                  <p
                    style={{
                      fontSize: "13px",
                      textAlign: "end",
                      marginTop: "4px",
                    }}
                  >
                    {msg.timestamp}{" "}
                  </p>
                </div>
              ))}
            </ol>
          </div>
        )}
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
                  <Select.Option value="Software">Software</Select.Option>
                  <Select.Option value="HCNS">HCNS</Select.Option>
                  <Select.Option value="MKT">MKT</Select.Option>
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
              name="chatRoom"
              layout="vertical"
              form={form}
              onFinish={onFinish}
            >
              <Flex align="center">
                <InputEmoji
                  value={textChat}
                  onChange={setTextChat}
                  cleanOnEnter
                  onEnter={onFinish}
                  placeholder="Nhập tin nhắn"
                />
                <Button
                  disabled={textChat.trim() === ""}
                  className="sendbutton"
                  size="large"
                  type="primary"
                  htmlType="submit"
                >
                  Gửi <RightCircleOutlined style={{ marginLeft: 8 }} />
                </Button>
              </Flex>
              <Form.Item style={{ textAlign: "center", marginTop: 20 }}>
                <Tooltip title="Rời khỏi phòng chat">
                  <Button
                    style={{ borderRadius: "50%", width: 50, height: 50 }}
                    size="large"
                    type="primary"
                    danger
                    onClick={leaveChatRoom}
                  >
                    <LogoutOutlined />
                  </Button>
                </Tooltip>
              </Form.Item>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
