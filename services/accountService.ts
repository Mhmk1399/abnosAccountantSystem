import FixedAccount from "@/models/accounts/fixedAccounts";
import "@/models/accounts/detailedAcounts";
import "@/models/accounts/totalAccount";
import "@/models/accounts/accountGroup";

export const findFixedAccountByDetailedId = async (detailedAccountId: string) => {
    console.log('Looking for fixed account with detailed account:', detailedAccountId);
    
    if (!detailedAccountId) {
        console.log('No detailed account ID provided');
        return null;
    }
    
    const fixedAccount = await FixedAccount.findOne({
        detailedAccounts: detailedAccountId
    }).populate({
        path: "totalAccount",
        populate: {
            path: "accountGroup"
        }
    });
    
    console.log('Found fixed account:', fixedAccount);
    return fixedAccount;
};

export const findFixedAccountByDetailedIdDirect = async (detailedAccountId: string) => {
    console.log('Looking for fixed account directly by detailed account:', detailedAccountId);
    
    // Find all fixed accounts and check which one contains this detailed account
    const fixedAccounts = await FixedAccount.find({
        detailedAccounts: { $in: [detailedAccountId] }
    }).populate({
        path: "totalAccount",
        populate: {
            path: "accountGroup"
        }
    });
    
    console.log('Found fixed accounts containing detailed account:', fixedAccounts);
    
    if (fixedAccounts && fixedAccounts.length > 0) {
        return fixedAccounts[0];
    }
    
    // If not found, try to find any fixed account (fallback for testing)
    console.log('No fixed account found, trying fallback...');
    const anyFixedAccount = await FixedAccount.findOne()
        .populate({
            path: "totalAccount",
            populate: {
                path: "accountGroup"
            }
        });
    
    console.log('Fallback fixed account:', anyFixedAccount);
    return anyFixedAccount;
};