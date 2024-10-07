import React, { useState, useRef } from 'react';
import './App.css';
import axios from 'axios';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';


function App() {
  const [type_system, setType_system] = useState("webenefit");
  const [file, setFile] = useState();
  const tableRef = useRef(null);

  const handleInputChange = (event) => {
    setFile(event.target.files[0]);
  };
  const upload = () => {
    if (file) {
      let formData = new FormData();
      formData.append("type_system", type_system);
      formData.append("file.txt", file);
      axios({
        method: "post",
        url: "/upload_file",
        data: formData,
        responseType: "blob",
      }).then((response) => {

        // create file link in browser's memory
        const href = URL.createObjectURL(response.data);

        // create "a" HTML element with href to file & click
        const link = document.createElement('a');
        link.href = href;
        link.setAttribute('download', 'BKMVDATA.txt'); //or any other extension
        document.body.appendChild(link);
        link.click();

        // clean up "a" element & remove ObjectURL
        document.body.removeChild(link);
        URL.revokeObjectURL(href);

        Swal.fire({
          title: 'ההמרה בוצעה בהצלחה',
          text: 'הקובץ החדש ממתין לכם בתיקיית ההורדות',
          icon: 'success',
          confirmButtonText: 'תודה',
          confirmButtonColor: '#2fc1a9'
        })
      });
    }
    else {
      Swal.fire({
        title: 'לא נבחר קובץ להמרה',
        text: '',
        icon: 'error',
        confirmButtonText: 'סגור',
        confirmButtonColor: '#2fc1a9'
      })
    }
  }

  return (
    <div className="App">
      <Container>
        <Row>
          <Col sm={4}></Col>
          <Col sm={4}>
            <div className='border_form'>
              <img src='logo.png' width={140}></img>
              <div className="text_label">בחרו את התוכנה ממנה תרצו לייבא</div>
              <Form.Select aria-label="Default select example" onChange={(e) => {setType_system(e.target.value)}} >
                <option value={"webenefit"}>וובנפיט - webenefit</option>
                <option value={"hashavshevet"}>חשבשבת - משרד שם טוב</option>
                <option value={"ramplus"}>רם פלוס</option>
                <option value={"summit"}>סאמיט</option>
                <option value={"rivhit"}>ריוחית</option>
                <option value={"finbot"}>פינבוט</option>              </Form.Select>
              <div className="text_label">בחרו את הקובץ אחיד בשם BKMVDATA</div>
              <Form.Control type="file" onChange={handleInputChange} name='webenefit' />
              <Button onClick={upload}>המר לקובץ אחיד של פינבוט</Button>
            </div>
          </Col>
          <Col sm={4}></Col>
        </Row>
      </Container>
    </div >);
}
//
export default App;
