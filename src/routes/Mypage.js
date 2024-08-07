import styled from "styled-components";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Profile from "../components/Profile";
import RecentLog from "../components/RecentLog";
import AnniversaryModal from "../components/AnniversaryModal";
//import axios from "axios";

//import refreshAccessToken from "../axios";
import api from "../axios";
import Marketing from "../components/Marketing";

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 100px;

  //iphone SE => width:375px;
  @media (max-width: 575px) {
  }
`;

const Content = styled.div`
  width: 70%;
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 50px;

  //iphone SE => width:375px;
  @media (max-width: 575px) {
    width: 90%;
    margin-top: 30px;
  }
`;

const TextArea = styled.div`
  width: 100%;
  display: flex;
  justify-content: end;
  margin-bottom: 30px;

  gap: 50px;

  cursor: pointer;
  @media (max-width: 575px) {
    gap: 20px;
    font-size: 14px;
  }
`;

// const DeleteAccount = styled.div`
//   width: 100%;
//   display: flex;
//   justify-content: end;
//   margin-bottom: 30px;

//   cursor: pointer;
//   @media (max-width: 575px) {
//     width: 90%;
//   }
// `;

function Mypage() {
  const [modal, setModal] = useState({
    open: false,
    modalType: null,
    id: null,
  });
  const [userInfo, setUserInfo] = useState({});
  const [anniversaries, setAnniversaries] = useState({});
  const [recentReco, setRecentReco] = useState({});
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("access_token");
  const memberId = localStorage.getItem("member_id");
  const [marketing, setMarketing] = useState({
    open: null,
    type: null,
  });

  useEffect(() => {
    if (localStorage.getItem("member_id") === null) {
      //비회원의 접근일 경우 메인으로 이동시키기
      navigate("/");
    } else {
      //회원의 접근일 경우 회원 정보 받아오기
      fetchData();
      fetchReco();
    }
  }, []);

  useEffect(() => {
    if (userInfo.alarm === false) {
      document.body.style.overflow = "hidden";
      setMarketing({ open: true, type: false });
    } else if (userInfo.alarm === true) {
      setMarketing({ open: false, type: true });
    }
  }, [userInfo.alarm]);

  const fetchData = async () => {
    try {
      const response = await api.get(`/member/${memberId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setUserInfo(response.data);
      setAnniversaries(response.data.anniversaries);
    } catch (error) {
      // if (error.response.status === 401) {
      //   refreshAccessToken(memberId, fetchData);
      // }
      console.error("Failed to fetch user data:", error);
    }
  };

  const fetchReco = async () => {
    try {
      const info1 = await api.get(
        `https://emotionfeedback.site/member/${memberId}/recommend/recent`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const info2 = await api.get(
        `https://emotionfeedback.site/member/${memberId}/harmony/recent`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const mergeRecentReco = (main, sub) => {
        const mainMap = main.reduce((acc, item) => {
          acc[item.order] = { ...item, other: [] };
          return acc;
        }, {});

        sub.forEach((item) => {
          if (mainMap[item.order]) {
            mainMap[item.order].other.push(item);
          }
        });

        return Object.values(mainMap);
      };

      setRecentReco(mergeRecentReco(info1.data, info2.data));
    } catch (error) {
      // if (error.response.status === 401) {
      //   refreshAccessToken(memberId, fetchReco);
      // }
      console.error("Failed to fetch user recommend data:", error);
    }
  };

  const addAnniversary = async (name, date, type) => {
    try {
      await api.post(
        `https://emotionfeedback.site/member/${memberId}/anniversary`,
        {
          name,
          date,
          type,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      fetchData();
      closeModal();
    } catch (error) {
      // if (error.response.status === 401) {
      //   refreshAccessToken(memberId, addAnniversary);
      // }
      console.error("Failed to add user anniversary:", error);
    }
  };

  const modifyAnniversary = async (name, date, type) => {
    try {
      await api.put(
        `https://emotionfeedback.site/member/${memberId}/anniversary/${modal.id}`,
        {
          name,
          date,
          type,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      fetchData();
      closeModal();
    } catch (error) {
      // if (error.response.status === 401) {
      //   refreshAccessToken(memberId, modifyAnniversary);
      // }
      console.error("Failed to add user anniversary:", error);
    }
  };

  const deleteAnniversary = async () => {
    const result = window.confirm("정말 삭제하시겠습니까?");
    if (result === false) {
      closeModal();
      return;
    }
    try {
      await api.delete(
        `https://emotionfeedback.site/member/${memberId}/anniversary/${modal.id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      fetchData();
      closeModal();
    } catch (error) {
      // if (error.response.status === 401) {
      //   refreshAccessToken(memberId, deleteAnniversary);
      // }
      console.error("Failed to add user anniversary:", error);
    }
  };

  const openModal = (type, id) => {
    document.body.style.overflow = "hidden";
    setModal({ open: true, modalType: type, id: id });
  };

  const closeModal = () => {
    document.body.style.overflow = "unset";
    setModal({ ...modal, open: false });
  };

  const openMarketing = () => {
    document.body.style.overflow = "hidden";

    setMarketing({ ...marketing, open: true });
  };

  const closeMarketing = () => {
    document.body.style.overflow = "unset";
    setMarketing({ ...marketing, open: false });
  };

  const modifyProfileImg = async (img, color) => {
    try {
      await api.put(
        `https://emotionfeedback.site/member/${memberId}/image`,
        {
          flowerCode: img,
          backgroundCode: color,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      fetchData();
    } catch (error) {
      // if (error.response.status === 401) {
      //   refreshAccessToken(memberId, modifyProfileImg);
      // }
      console.error("Failed to add user profile image:", error);
    }
  };

  const changeMarketing = async (alarm) => {
    try {
      await api.put(
        `https://emotionfeedback.site/member/${memberId}/alarm`,
        {
          alarm,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      fetchData();
    } catch (error) {
      // if (error.response.status === 401) {
      //   refreshAccessToken(memberId, changeMarketing);
      // }
      console.error("Failed to change marketing:", error);
    }
  };

  const settingTruePrefer = async (order) => {
    try {
      await api.get(
        `https://emotionfeedback.site/member/${memberId}/${order}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      fetchReco();
    } catch (error) {
      // if (error.response.status === 401) {
      //   refreshAccessToken(memberId, settingTruePrefer);
      // }
      console.error("Failed to add user profile image:", error);
    }
  };

  const settingFalsePrefer = async (order) => {
    try {
      await api.delete(
        `https://emotionfeedback.site/member/${memberId}/${order}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      fetchReco();
    } catch (error) {
      // if (error.response.status === 401) {
      //   refreshAccessToken(memberId, settingFalsePrefer);
      // }
      console.error("Failed to add user profile image:", error);
    }
  };

  const deleteUser = async () => {
    const result = window.confirm("정말 탈퇴하시겠습니까?");
    if (result === false) {
      return;
    }
    try {
      await api.get(`https://emotionfeedback.site/member/${memberId}/resign`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      localStorage.clear();
      navigate("/");
    } catch (error) {
      // if (error.response.status === 401) {
      //   refreshAccessToken(memberId, deleteUser);
      // }
      console.error("Failed to delete user", error);
    }
  };

  return (
    <Wrapper>
      {marketing.open ? (
        <Marketing
          closeMarketing={closeMarketing}
          changeMarketing={changeMarketing}
          marketing={marketing}
        />
      ) : null}
      {modal.open ? (
        <AnniversaryModal
          closeModal={closeModal}
          modal={modal.modalType}
          anniversary={anniversaries.filter((v) => v.id === parseInt(modal.id))}
          addAnniversary={addAnniversary}
          modifyAnniversary={modifyAnniversary}
          deleteAnniversary={deleteAnniversary}
        />
      ) : null}
      <Header login={true} />
      <Content>
        <Profile
          openModal={openModal}
          userInfo={userInfo}
          anniversaries={anniversaries}
          modifyProfileImg={modifyProfileImg}
        />
        <RecentLog
          userName={userInfo.nickname}
          recentReco={recentReco}
          settingTruePrefer={settingTruePrefer}
          settingFalsePrefer={settingFalsePrefer}
        />
        <TextArea>
          <div onClick={openMarketing}>
            {marketing.type ? "마케팅 수신 동의 철회" : "마케팅 수신 동의"}
          </div>
          <div onClick={deleteUser}>회원탈퇴</div>
        </TextArea>
      </Content>
    </Wrapper>
  );
}

export default Mypage;
