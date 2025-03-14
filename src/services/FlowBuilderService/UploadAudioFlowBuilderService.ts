import { FlowAudioModel } from "../../models/FlowAudio";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import { FlowImgModel } from "../../models/FlowImg";

interface Request {
  userId: number;
  name: string;
  companyId: number
}

const UploadAudioFlowBuilderService = async ({
  userId,
  name,
  companyId
}: Request): Promise<FlowAudioModel> => {
  try {
    const flowImg = await FlowAudioModel.create({
      userId: userId,
      companyId: companyId,
      name: name,
    });

    return flowImg;
  } catch (error) {
    console.error("Erro ao inserir o usuário:", error);

    return error
  }
};

export default UploadAudioFlowBuilderService;
