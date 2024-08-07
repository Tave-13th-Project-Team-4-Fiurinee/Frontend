import Header from "../components/Header";
import styled from "styled-components";
import RecommendLogItem from "../items/RecommendLogItem";

//import axios from "axios";
//import refreshAccessToken from "../axios";

import api from "../axios";

import { useState, useEffect } from "react";

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  padding-bottom: 150px;
`;

const Title = styled.div`
  width: 70%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 575px) {
    width: 90%;
  }
`;

const Container = styled.div`
  width: 70%;
  display: flex;
  flex-direction: column;
  gap: 50px;

  @media (max-width: 575px) {
    width: 90%;
  }
`;

const LikeBtn = styled.button`
  width: 150px;
  height: 40px;
  background-color: #fad5d5;
  border: none;
  border-radius: 10px;
  color: #ea8989;

  cursor: pointer;
`;

function RecommendLogPage() {
  const [recommend, setRecomment] = useState();
  const [likeMode, setLikeMode] = useState(false);
  const [userInfo, setUserInfo] = useState({});

  const accessToken = localStorage.getItem("access_token");
  const memberId = localStorage.getItem("member_id");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (likeMode) {
      fetchLikeData();
    } else {
      fetchTotalData();
    }
  }, [likeMode]);

  const fetchData = async () => {
    try {
      const response = await api.get(`/member/${memberId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setUserInfo(response.data);
    } catch (error) {
      // if (error.response.status === 401) {
      //   refreshAccessToken(memberId, fetchData);
      // }
      console.error("Failed to fetch user data:", error);
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

      if (likeMode) {
        fetchLikeData();
      } else {
        fetchTotalData();
      }
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

      if (likeMode) {
        fetchLikeData();
      } else {
        fetchTotalData();
      }
    } catch (error) {
      // if (error.response.status === 401) {
      //   refreshAccessToken(memberId, settingFalsePrefer);
      // }
      console.error("Failed to add user profile image:", error);
    }
  };

  const fetchTotalData = async () => {
    try {
      const info1 = await api.get(
        `https://emotionfeedback.site/member/${memberId}/recommend`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const info2 = await api.get(
        `https://emotionfeedback.site/member/${memberId}/harmony`,
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

      setRecomment(mergeRecentReco(info1.data, info2.data));
    } catch (error) {
      // if (error.response.status === 401) {
      //   refreshAccessToken(memberId, fetchTotalData);
      // }
      console.error("Failed to fetch user recommend data:", error);
    }
  };

  const fetchLikeData = async () => {
    try {
      const info1 = await api.get(
        `https://emotionfeedback.site/member/${memberId}/prefer/recommend`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const info2 = await api.get(
        `https://emotionfeedback.site/member/${memberId}/prefer/harmony`,
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

      setRecomment(mergeRecentReco(info1.data, info2.data));
    } catch (error) {
      // if (error.response.status === 401) {
      //   refreshAccessToken(memberId, fetchLikeData);
      // }
      console.error("Failed to fetch user recommend data:", error);
    }
  };

  const handleLikeReco = () => {
    setLikeMode(!likeMode);
  };

  return (
    <Wrapper>
      <Header login={true} />
      <Title>
        <div>나의 추천 기록</div>
        {likeMode ? (
          <LikeBtn onClick={handleLikeReco}>♡ 전체 목록 보기</LikeBtn>
        ) : (
          <LikeBtn onClick={handleLikeReco}>♥ 찜한 목록만 보기</LikeBtn>
        )}
      </Title>
      <Container>
        {recommend === undefined
          ? "추천기록이 없습니다."
          : recommend
              .reverse()
              .map((v, i) => (
                <RecommendLogItem
                  key={i}
                  info={v}
                  settingTruePrefer={settingTruePrefer}
                  settingFalsePrefer={settingFalsePrefer}
                  userName={userInfo.nickname}
                />
              ))}
      </Container>
    </Wrapper>
  );
}

export default RecommendLogPage;
