import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import './ProfilePage.css'; // External CSS

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedImg, setSelectedImg] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (authUser) {
      setName(authUser.fullName || "");
      setBio(authUser.bio || "");
    }
  }, [authUser]);

  useEffect(() => {
    if (!selectedImg) {
      setPreviewImg(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImg);
    setPreviewImg(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImg]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
      navigate('/');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onload = async () => {
      const base64Image = reader.result;
      await updateProfile({ profilePic: base64Image, fullName: name, bio });
      navigate('/');
    };
  };

  return (
    <div className="profile-page-wrapper">
      <div className="profile-card">
        <form onSubmit={handleSubmit} className="profile-form">
          <h3 className="profile-heading">Profile details</h3>

          <label htmlFor="avatar" className="avatar-label">
            <input
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
              onChange={(e) => setSelectedImg(e.target.files[0])}
            />
            <img
              src={previewImg || authUser?.profilePic || assets.avatar_icon}
              alt="avatar"
              className="avatar-img"
            />
            Upload profile image
          </label>

          <input
            type="text"
            required
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />

          <textarea
            placeholder="Your bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="input-field textarea"
          />

          <button type="submit" className="save-button">
            Save
          </button>
        </form>

        <img
          className="profile-preview"
          src={previewImg || authUser?.profilePic || assets.logo_icon}
          alt="profile-preview"
        />
      </div>
    </div>
  );
};

export default ProfilePage;
