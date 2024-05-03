import pyttsx3
from fastapi import FastAPI, HTTPException
from starlette.responses import StreamingResponse
from starlette.responses import Response
from pydantic import BaseModel
import uuid
import uvicorn
import os
import io
import json
from audio_merge import merge_audio_files_with_delay

from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost",
    "http://localhost:3000",
]


app = FastAPI()
mp3_directory = "backend/src/assets/audio"

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Texts(BaseModel):
    texts: list[str]


@app.post("/text2speech")
async def process_text(body: Texts):
    dir_path = str(uuid.uuid4())
    os.mkdir(mp3_directory + "/" + dir_path)
    file_names = []
    for index, text in enumerate(body.texts):
        file_name = text2speech(dir_path, index, text)
        file_names.append(dir_path + "/" + file_name)

    return get_mp3_files(file_names)


@app.get("/merge-audio")
async def merge_audio_files(directory_path: str, delay_duration: int = 2000):
    if not os.path.isdir(mp3_directory + "/" + directory_path):
        raise HTTPException(status_code=404, detail="Directory not found")

    merged_audio = merge_audio_files_with_delay(
        mp3_directory + "/" + directory_path, delay_duration
    )

    audio_data = io.BytesIO()
    merged_audio.export(audio_data, format="mp3")
    audio_data.seek(0)

    return StreamingResponse(audio_data, media_type="audio/mpeg")


def get_mp3_files(file_ids: list[str]):
    for file_id in file_ids:
        mp3_file_path = f"{mp3_directory}/{file_id}"
        if not os.path.exists(mp3_file_path):
            raise HTTPException(status_code=404, detail="MP3 file not found")

    return Response(content=json.dumps(file_ids), media_type="application/json")


def text2speech(dir_path, index: int, text: str):
    engine = pyttsx3.init()
    file_name = str(index) + ".mp3"
    engine.setProperty("rate", 120)
    engine.setProperty("volume", 1)
    voices = engine.getProperty("voices")
    engine.setProperty("voice", voices[1].id)
    engine.save_to_file(text, mp3_directory + "/" + dir_path + "/" + file_name)
    engine.runAndWait()
    return file_name


if __name__ == "__main__":
    uvicorn.run("text2speech:app", port=8443)
