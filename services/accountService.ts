import FixedAccount from "@/models/accounts/fixedAccounts";
import "@/models/accounts/detailedAcounts";
import "@/models/accounts/totalAccount";
import "@/models/accounts/accountGroup";

export const findFixedAccountByDetailedId = async (detailedAccountId: string) => {
    return await FixedAccount.findOne({
        detailedAccounts: detailedAccountId
    }).populate({
        path: "totalAccount",
        populate: {
            path: "accountGroup"
        }
    });
};