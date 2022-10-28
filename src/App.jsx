import React, { useState, useEffect } from "react";
import {
  urlClient,
  LENS_HUB_CONTRACT_ADDRESS,
  queryExplorePublications,
  queryRecommendedProfiles,
} from "./queries";

// ABI
import LENSHUB from "./lenshub.json";
import { ethers } from "ethers";
import { Box, Button, Image } from "@chakra-ui/react";
import "./index.css";

import "./App.css";
import logo from "./follow-icon.png";

function App() {
  const [account, setAccount] = useState(null);
  // Profiles and posts that lens provide
  const [profiles, setProfiles] = useState([]);
  // 1. hightlight the varibale 2. ctrl+alt+l to console log

  const [posts, setPosts] = useState([]);

  const signIn = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
  };

  const getRecommendedProfiles = async () => {
    const response = await urlClient
      .query(queryRecommendedProfiles)
      .toPromise();
    const profiles = response.data.recommendedProfiles.slice(0, 5);
    setProfiles(profiles);
  };

  const getPosts = async () => {
    const response = await urlClient
      .query(queryExplorePublications)
      .toPromise();
    const posts = response.data.explorePublications.items.filter((post) => {
      // return only those posts whose profile exists
      if (post.profile) return post;
      return "";
    });
    setPosts(posts);
  };

  // Sigining transactions and using the smart contract functions
  // const follow = id = async() => {
  async function follow(id) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      LENS_HUB_CONTRACT_ADDRESS,
      LENSHUB,
      provider.getSigner()
    );
    const tx = await contract.follow([parseInt(id)], [0x0]);
    await tx.wait();
  }

  // These functions should be called as soon as the page loads
  // Rest functions like sign in can be called on the button actions
  useEffect(() => {
    getRecommendedProfiles();
    getPosts();
  }, []);

  // Append values to the string of the url
  const parseImageUrl = (profile) => {
    if (profile) {
      const url = profile.picture?.original?.url;
      // If it's am IFPS url
      if (url && url.startsWith("ipfs:")) {
        const ipfsHash = url.split("//")[1];
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      }
      return url;
    }
    return "default-avatar.png";
  };

  return (
    <div className="app">
      <Box width="100%" opacity="0.75" backgroundColor="rgb(0,0,0)">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="55%"
          margin="auto"
          color="white"
          padding="10px 0"
        >
          <Box>
            <Box
              fontFamily="DM Serif Display"
              fontSize="44px"
              fontStyle="italic"
            >
              ONxChain
            </Box>
            <Box>Decentralized Social Media App</Box>
          </Box>
          {account ? (
            <Box backgroundColor="#000" padding="15px" borderRadius="6px">
              Connected
            </Box>
          ) : (
            <Button
              onClick={signIn}
              color="rgba(5,32,64)"
              _hover={{ backgroundColor: "#808080" }}
            >
              Connect
            </Button>
          )}
        </Box>
      </Box>

      {/* Content */}

      <Box
        display="flex"
        justifyContent="space-between"
        width="55%"
        margin="53px auto auto auto"
        color="white"
      >
        {/* Posts */}
        <Box width="65%" maxWidth="65%" minWidth="65%">
          {posts.map((post) => (
            <Box
              key={post.id}
              marginBottom="25px"
              backgroundColor="rgba(5,32,64,28)"
              padding="40px 30px 40px 25px"
              borderRadius="6px"
            >
              <Box display="flex">
                {/* Profile Img */}
                <Box width="75px" height="75px" marginTop="8px">
                  <img
                    src={parseImageUrl(post.profile)}
                    alt="profile"
                    width="75px"
                    height="75px"
                    // if the api gives error then use the default image
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null;
                      currentTarget.src = "/default-avatar.png";
                    }}
                  />
                </Box>
                {/* Profile post content */}
                <Box flexGrow={1} marginLeft="20px">
                  <Box display="flex" justifyContent="space-between">
                    <Box fontFamily="Dm Serif Display" fontSize="24px">
                      {post.profile?.handle}
                    </Box>
                    <Box height="50px" _hover={{ cursor: "pointer" }}>
                      <Image
                        alt="follow-icon"
                        src={logo}
                        width="50px"
                        height="50px"
                        onClick={() => follow(post.id)}
                      />
                    </Box>
                  </Box>
                  <Box overflowWrap="anywhere" fontSize="14px">
                    {post.metadata?.content}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
        {/* Friend suggestions */}
        <Box
          width="30%"
          backgroundColor="rgba(5,32,64,28)"
          padding="40px 25px"
          borderRadius="6px"
          height="fit-content"
        >
          <Box fontFamily="DM Serif Display">Friend Suggestions</Box>
          <Box>
            {profiles.map((profile, i) => (
              <Box
                key={profile.id}
                margin="30px 0"
                display="flex"
                alignItems="center"
                height="40px"
                _hover={{ color: "#808080", cursor: "pointer" }}
              >
                <img
                  src={parseImageUrl(profile)}
                  alt="profile"
                  width="40px"
                  height="40px"
                  // if the api gives error then use the default image
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    currentTarget.src = "/default-avatar.png";
                  }}
                />
                <Box marginLeft="25px" >
                    <h4>{profile.name}</h4>
                    <p>{profile.handle}</p>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </div>
  );
}

export default App;
