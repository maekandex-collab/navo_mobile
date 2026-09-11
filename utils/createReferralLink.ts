import branch from 'react-native-branch';

const createReferralLink = async (referralCode: string) => {
  const buo = await branch.createBranchUniversalObject(
    "referral",
    {
      title: "Join Navo",
      contentDescription: "Earn rewards when you sign up!",
      contentMetadata: {
        customMetadata: {
          referralCode: referralCode,
        },
      },
    }
  );

  const { url } = await buo.generateShortUrl({
    feature: "referral",
  });

  return url;
};

export default createReferralLink 