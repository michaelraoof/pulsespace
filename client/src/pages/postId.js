import axios from "axios";

import { useEffect, useState } from "react";
import InfoBox from "components/HelperComponents/InfoBox";
import baseUrl from "utils/baseUrl";
import styled from "styled-components";
import Header from "components/Header";
import Sidebar from "components/Sidebar";
import PostCard from "components/PostCard";
import useBearStore from "store/store";
import { ExclamationCircleIcon } from "@heroicons/react/outline";
import cookie from "js-cookie";
import { useParams } from "react-router-dom";

function PostPageById() {
  const user = useBearStore((state) => state.user);
  const params = useParams();

  const [post, setPost] = useState(null);
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = cookie.get("token");
        const { postId } = params;
        const res = await axios.get(`${baseUrl}/api/posts/${postId}`, {
          headers: { Authorization: token },
        });

        setPost(res.data);
      } catch (error) {
        setErrorLoading(true);
      }
    };

    fetchData();
  }, []);
  if (errorLoading) {
    return (
      <InfoBox
        Icon={ExclamationCircleIcon}
        message={"Sorry, no post found."}
        content={"No post was found with the specified post ID."}
      />
    );
  }
  if (post)
    return (
      <div className="bg-gray-100 min-h-screen">
        <Header user={user} />

        <main className="flex ">
          <Sidebar user={user} />
          <div className="flex-grow h-full pt-6 mr-5 xl:mr-40 ml-20 md:ml-0 md:mr-0  scrollbar-hide">
            <div className="mx-auto max-w-md md:max-w-lg lg:max-w-2xl">
              <PostCard
                key={post._id}
                post={post}
                user={user}
                postById={true}
                setPosts={setPost}
              />
            </div>
          </div>
        </main>
      </div>
    );
}

export default PostPageById;

const Image = styled.img`
  object-fit: cover;
  height: 2.95rem;
  width: 2.95rem;
  border-radius: 50%;
`;

const PostImage = styled.img`
  object-fit: contain;
  height: auto;
  width: 100%;
  margin-top: 0.35rem;
  margin-bottom: 1.2rem;
  transition: all 0.22s ease-out;
  border-top: 0.7px solid lightgrey;
  border-bottom: 0.7px solid lightgrey;
`;

const UserPTag = styled.p`
  cursor: pointer;
  margin-bottom: -0.09rem;
  font-weight: 500;
  font-size: 1.05rem;
  :hover {
    text-decoration: underline;
  }
`;

const ThreeDotsDiv = styled.div`
  height: 2.1rem;
  width: 2.1rem;
  border-radius: 50%;
  cursor: pointer;
  padding: 0.1rem;
  font-size: 1.2rem;
  :hover {
    background-color: whitesmoke;
  }
`;
