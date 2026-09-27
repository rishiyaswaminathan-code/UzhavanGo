import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { getProduceImage, identifyProduce } from '../utils/produceImages';
import { parseTamilVoiceInput } from '../utils/tamilVoiceParser';
import { Search, PlusCircle, CheckCircle2, Shield, Trash2, Eye, MapPin, Scale, Sparkles, Sprout, Mic, MicOff, Volume2, Camera, Upload, X, RefreshCw } from 'lucide-react';

export function MarketPage({ showToast, setActivePage }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [offersList, setOffersList] = useState([]);

  // Voice Assistant state for Tamil listing
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Camera & Custom Photo state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedTempPhoto, setCapturedTempPhoto] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  // Form states
  const [postForm, setPostForm] = useState({
    productName: '',
    quantity: '',
    unit: 'kg',
    location: user?.location || 'Madurai, Tamil Nadu',
    description: '',
    harvestDate: '',
    deliveryInfo: '',
    image: null
  });

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Stop voice recognition and camera on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      stopCameraStream();
    };
  }, []);

  const handleStartCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('Camera access is not supported by your browser. Please choose a photo from your device.', 'info');
        if (fileInputRef.current) fileInputRef.current.click();
        return;
      }

      stopCameraStream();
      setCapturedTempPhoto(null);
      setIsCameraOpen(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error);
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setIsCameraOpen(false);
      stopCameraStream();
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        showToast('Camera permission denied. You can choose a photo file from your device.', 'error');
      } else {
        showToast('Could not open camera. You can choose a photo file from your device.', 'info');
      }
      if (fileInputRef.current) fileInputRef.current.click();
    }
  };

  const handleSnapPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedTempPhoto(dataUrl);
    stopCameraStream();
  };

  const handleUseCapturedPhoto = () => {
    if (capturedTempPhoto) {
      setPostForm(prev => ({ ...prev, image: capturedTempPhoto }));
      setCapturedTempPhoto(null);
      setIsCameraOpen(false);
      stopCameraStream();
      showToast('Custom photo attached to this harvest listing!', 'success');
    }
  };

  const handleRetakePhoto = () => {
    setCapturedTempPhoto(null);
    handleStartCamera();
  };

  const handleCancelCamera = () => {
    stopCameraStream();
    setCapturedTempPhoto(null);
    setIsCameraOpen(false);
  };

  const handleRemoveCustomPhoto = () => {
    setPostForm(prev => ({ ...prev, image: null }));
    showToast('Returned to automatic produce image.', 'info');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        setPostForm(prev => ({ ...prev, image: compressed }));
        showToast('Custom photo attached from device!', 'success');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleStartTamilVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Tamil Speech Recognition is not supported by this browser. You can type manually.', 'info');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'ta-IN'; // Tamil (India)
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        showToast('🎙 Listening... Please speak crop name and quantity in Tamil or English.', 'info');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        if (event.results && event.results[0] && event.results[0][0]) {
          transcript = event.results[0][0].transcript;
        }

        if (transcript) {
          setVoiceTranscript(transcript);
          const parsed = parseTamilVoiceInput(transcript);

          setPostForm((prev) => ({
            ...prev,
            productName: parsed.productName || transcript,
            quantity: parsed.quantity || prev.quantity,
            unit: parsed.unit || prev.unit
          }));

          const filledInfo = [];
          if (parsed.productName) filledInfo.push(`Produce: ${parsed.productName}`);
          if (parsed.quantity) filledInfo.push(`Quantity: ${parsed.quantity} ${parsed.unit}`);

          showToast(
            `🎙 Heard: "${transcript}" ${filledInfo.length ? `(Auto-filled ${filledInfo.join(', ')})` : ''}`,
            'success'
          );
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          showToast('Microphone permission was denied. Please allow microphone access or type manually.', 'error');
        } else if (event.error === 'no-speech') {
          showToast('No speech was detected. Please try clicking the mic again or type manually.', 'info');
        } else {
          showToast(`Voice input notice: ${event.error}. You can continue typing manually.`, 'info');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
      showToast('Could not initialize speech recognition. You can type manually.', 'info');
    }
  };

  const handleStopTamilVoice = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
  };

  const [bidForm, setBidForm] = useState({
    offeredPrice: '',
    quantity: '',
    message: ''
  });

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await api.getPosts();
      setPosts(data);
    } catch (err) {
      showToast(err.message || 'Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in as a farmer to publish harvest listings.', 'info');
      if (setActivePage) setActivePage('profile');
      return;
    }
    try {
      await api.createPost(postForm);
      showToast(
        postForm.image
          ? 'Harvest listing published with your custom captured photo!'
          : 'Harvest listing published with auto-assigned produce image!',
        'success'
      );
      setIsPostModalOpen(false);
      setVoiceTranscript('');
      handleStopTamilVoice();
      stopCameraStream();
      setIsCameraOpen(false);
      setCapturedTempPhoto(null);
      setPostForm({
        productName: '',
        quantity: '',
        unit: 'kg',
        location: user?.location || 'Madurai, Tamil Nadu',
        description: '',
        harvestDate: '',
        deliveryInfo: '',
        image: null
      });
      loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.deletePost(postId);
      showToast('Listing deleted successfully', 'info');
      loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenBidModal = (post) => {
    if (!user) {
      showToast('Please sign in to place a private bid.', 'info');
      if (setActivePage) setActivePage('profile');
      return;
    }
    if (user?.role === 'farmer' && (
      String(post.farmerId ?? post.farmer_id) === String(user?.id) ||
      (post.farmerName && user?.name && post.farmerName.trim().toLowerCase() === user.name.trim().toLowerCase()) ||
      (post.farmer_name && user?.name && post.farmer_name.trim().toLowerCase() === user.name.trim().toLowerCase())
    )) {
      showToast('You cannot bid on your own produce.', 'error');
      return;
    }
    const avail = parseFloat(post.availableQuantity !== undefined ? post.availableQuantity : post.quantity);
    if (avail <= 0 || post.status === 'Sold Out' || post.status === 'Closed') {
      showToast('This listing is sold out and no longer accepting bids.', 'error');
      return;
    }
    setSelectedPost(post);
    setBidForm({
      offeredPrice: '',
      quantity: '',
      message: ''
    });
    setIsBidModalOpen(true);
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    const maxAvail = parseFloat(selectedPost?.availableQuantity !== undefined ? selectedPost.availableQuantity : selectedPost?.quantity);
    const enteredQty = parseFloat(bidForm.quantity);

    if (enteredQty > maxAvail) {
      showToast(`Only ${maxAvail} ${selectedPost?.unit} remaining.`, 'error');
      return;
    }
    if (enteredQty <= 0 || isNaN(enteredQty)) {
      showToast('Please enter a valid positive quantity.', 'error');
      return;
    }

    try {
      await api.submitOffer(selectedPost.id, bidForm);
      showToast('Your bid has been submitted privately.', 'success');
      setIsBidModalOpen(false);
      loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleViewOffers = async (post) => {
    try {
      setSelectedPost(post);
      const offers = await api.getPostOffers(post.id);
      setOffersList(offers);
      setIsOffersModalOpen(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      const result = await api.selectOffer(offerId);
      const remaining = result.remainingQuantity !== undefined ? result.remainingQuantity : (result.order ? 'updated' : '');
      showToast(`Bid accepted! Order ${result.order.id} generated (${result.order.quantity}). Remaining: ${remaining} ${selectedPost?.unit}`, 'success');
      
      // Update selectedPost state for real-time modal update
      if (selectedPost) {
        const updatedPost = {
          ...selectedPost,
          availableQuantity: result.remainingQuantity,
          soldQuantity: (selectedPost.soldQuantity || 0) + parseFloat(result.offer.quantity),
          status: result.listingStatus || (result.remainingQuantity <= 0 ? 'Sold Out' : 'Active')
        };
        setSelectedPost(updatedPost);
        const offers = await api.getPostOffers(selectedPost.id);
        setOffersList(offers);
      }
      loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredPosts = posts.filter((p) => {
    const query = search.toLowerCase().trim();
    return !query ||
      p.productName.toLowerCase().includes(query) ||
      p.location.toLowerCase().includes(query) ||
      (p.farmerName && p.farmerName.toLowerCase().includes(query));
  });

  const liveMatched = identifyProduce(postForm.productName);
  const autoImage = liveMatched ? liveMatched.image : null;
  const currentDisplayImage = postForm.image || autoImage;

  return (
    <div className="market-page">
      {/* Header & Role Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1f2937' }}>
            Produce Marketplace
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            {user?.role === 'farmer'
              ? 'Post your fresh harvest and review confidential bids submitted by buyers.'
              : 'Browse fresh harvests directly from verified farms and submit your private bids.'}
          </p>
        </div>

        {user?.role === 'farmer' && (
          <button className="btn btn-primary" onClick={() => setIsPostModalOpen(true)}>
            <PlusCircle size={18} />
            Post New Harvest
          </button>
        )}
      </div>

      {/* Clean Search Bar (Zero Grading Filters) */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by produce name (e.g. Paddy, Tomatoes, Onions) or farm location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        </div>
      </div>

      {/* Produce Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          Loading produce marketplace...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>No harvest listings found matching your search.</p>
          {user?.role === 'farmer' && (
            <button className="btn btn-primary" onClick={() => setIsPostModalOpen(true)}>
              Post the First Harvest
            </button>
          )}
        </div>
      ) : (
        <div className="grid-cards">
          {filteredPosts.map((post) => {
            const displayImage = post.image || getProduceImage(post.productName);
            const isOwnProduce = user?.role === 'farmer' && (
              String(post.farmerId ?? post.farmer_id) === String(user?.id) ||
              (post.farmerName && user?.name && post.farmerName.trim().toLowerCase() === user.name.trim().toLowerCase()) ||
              (post.farmer_name && user?.name && post.farmer_name.trim().toLowerCase() === user.name.trim().toLowerCase())
            );

            return (
              <div key={post.id} className="product-card">
                {/* Automatic Produce Image with clean fallback */}
                <div className="product-image" style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={post.productName}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      display: displayImage ? 'none' : 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      padding: '1rem',
                      textAlign: 'center',
                      color: '#64748b'
                    }}
                  >
                    <Sprout size={36} color="#16a34a" style={{ marginBottom: '0.4rem', opacity: 0.85 }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Image not available for this produce yet</span>
                  </div>
                  {(() => {
                    const avail = parseFloat(post.availableQuantity !== undefined ? post.availableQuantity : post.quantity);
                    const isSoldOut = avail <= 0 || post.status === 'Sold Out' || post.status === 'Closed';
                    return (
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: isSoldOut ? '#dc2626' : '#166534',
                          color: 'white',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          zIndex: 2
                        }}
                      >
                        {isSoldOut ? 'Sold Out' : 'Active'}
                      </span>
                    );
                  })()}
                </div>

                <div className="product-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 className="product-title">{post.productName}</h3>
                    {isOwnProduce && (
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        title="Delete listing"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <div className="product-meta">
                    <span>👨‍🌾 {post.farmerName}</span>
                    <span>📍 {post.location}</span>
                  </div>

                  {/* Quantity Display: Detailed breakdown for farmer; Available quantity for buyers */}
                  {isOwnProduce ? (
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      padding: '0.6rem 0.75rem',
                      margin: '0.5rem 0',
                      fontSize: '0.82rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#4b5563' }}>Total Quantity:</span>
                        <strong style={{ color: '#1f2937' }}>{post.totalQuantity ?? post.quantity} {post.unit}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#166534' }}>Available Quantity:</span>
                        <strong style={{ color: (post.availableQuantity !== undefined && post.availableQuantity <= 0) ? '#dc2626' : '#166534' }}>
                          {post.availableQuantity !== undefined ? post.availableQuantity : post.quantity} {post.unit}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#4b5563' }}>Sold / Purchased:</span>
                        <strong style={{ color: '#0284c7' }}>{post.soldQuantity || 0} {post.unit}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #dcfce7', paddingTop: '0.25rem' }}>
                        <span style={{ color: '#4b5563' }}>Status:</span>
                        <strong style={{ color: (post.availableQuantity !== undefined && post.availableQuantity <= 0) ? '#dc2626' : '#166534' }}>
                          {(post.availableQuantity !== undefined && post.availableQuantity <= 0) ? 'Sold Out / Closed' : 'Active'}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <div className="product-meta" style={{ margin: '0.5rem 0' }}>
                      <span style={{
                        fontWeight: 700,
                        color: ((post.availableQuantity !== undefined && post.availableQuantity <= 0) || post.status === 'Sold Out') ? '#dc2626' : '#1b5e20',
                        fontSize: '0.95rem'
                      }}>
                        {((post.availableQuantity !== undefined && post.availableQuantity <= 0) || post.status === 'Sold Out')
                          ? '❌ Sold Out'
                          : `⚖️ ${post.availableQuantity !== undefined ? post.availableQuantity : post.quantity} ${post.unit} available`}
                      </span>
                      <span style={{ color: '#0284c7', fontWeight: 600, fontSize: '0.8rem' }}>
                        ⚡ Discovery Bidding
                      </span>
                    </div>
                  )}

                  <p className="product-desc">
                    {post.description || 'Fresh harvest direct from verified farm soil.'}
                  </p>

                  {/* Actions */}
                  {isOwnProduce ? (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: 'auto' }}
                      onClick={() => handleViewOffers(post)}
                    >
                      <Eye size={16} />
                      View Bids &amp; Sales Summary
                    </button>
                  ) : user?.role === 'buyer' ? (
                    ((post.availableQuantity !== undefined ? post.availableQuantity : post.quantity) > 0 && post.status !== 'Sold Out' && post.status !== 'Closed') ? (
                      <button
                        className="btn btn-accent"
                        style={{ width: '100%', marginTop: 'auto' }}
                        onClick={() => handleOpenBidModal(post)}
                      >
                        <Shield size={16} />
                        Submit Private Bid
                      </button>
                    ) : (
                      <button
                        disabled
                        className="btn btn-outline"
                        style={{ width: '100%', marginTop: 'auto', background: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }}
                      >
                        Sold Out
                      </button>
                    )
                  ) : (
                    <button
                      className="btn btn-outline"
                      style={{ width: '100%', marginTop: 'auto' }}
                      onClick={() => handleViewOffers(post)}
                    >
                      <Eye size={16} />
                      Inspect Listing
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Post New Harvest (Farmer) - No image upload, no grade */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
          setVoiceTranscript('');
          handleStopTamilVoice();
          stopCameraStream();
          setIsCameraOpen(false);
          setCapturedTempPhoto(null);
        }}
        title="Post Fresh Harvest"
      >
        <form onSubmit={handleCreatePost}>
          {/* Live Automatic Produce Image Preview */}
          <div style={{
            background: liveMatched ? '#f0fdf4' : '#f8fafc',
            border: liveMatched ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#e2e8f0',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {autoImage ? (
                <img
                  src={autoImage}
                  alt="Automatic Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Sprout size={32} color="#94a3b8" />
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: liveMatched ? '#166534' : '#475569', fontWeight: 700, fontSize: '0.9rem' }}>
                <Sparkles size={16} color={liveMatched ? '#16a34a' : '#94a3b8'} />
                {liveMatched ? `✅ Identified: ${liveMatched.label} (${liveMatched.category})` : 'Automatic Produce Identification'}
              </div>
              <p style={{ fontSize: '0.78rem', color: liveMatched ? '#15803d' : '#64748b', marginTop: '0.2rem' }}>
                {liveMatched
                  ? 'System automatically matched this verified realistic image. No manual photo upload needed!'
                  : postForm.productName.trim()
                    ? 'Image not available for this produce yet. You can still publish your listing safely!'
                    : 'Type a produce name (e.g. Apple, Cucumber, Cabbage, Mango, Tomato) to see the realistic photo automatically assign.'}
              </p>
            </div>
          </div>

          {/* SECTION: Product Photo (Optional) */}
          <div className="form-group" style={{
            background: '#ffffff',
            border: postForm.image ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.25rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Camera size={16} color="#166534" />
                <label className="form-label" style={{ margin: 0, fontWeight: 700, color: '#1f2937' }}>
                  Product Photo (Optional)
                </label>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '12px',
                  background: postForm.image ? '#dcfce7' : '#f1f5f9',
                  color: postForm.image ? '#166534' : '#64748b'
                }}>
                  {postForm.image ? '📸 Real Photo Active' : 'Optional'}
                </span>
              </div>

              {postForm.image && (
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.75rem',
                    color: '#dc2626',
                    borderColor: '#fca5a5',
                    background: 'white'
                  }}
                  onClick={handleRemoveCustomPhoto}
                  title="Remove custom photo and return to automatic produce image"
                >
                  <Trash2 size={12} /> Return to Auto Image
                </button>
              )}
            </div>

            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
              An image is automatically displayed based on your produce name. You can also capture your own photo.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Image Preview Thumbnail */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#f8fafc',
                border: postForm.image ? '2px solid #16a34a' : '1px solid #cbd5e1',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {currentDisplayImage ? (
                  <img
                    src={currentDisplayImage}
                    alt="Current Produce Image"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Sprout size={32} color="#94a3b8" />
                )}
                <span style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  background: postForm.image ? '#166534' : 'rgba(30,41,59,0.85)',
                  color: 'white',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  padding: '1px 4px',
                  borderRadius: '3px'
                }}>
                  {postForm.image ? 'Custom' : 'Auto'}
                </span>
              </div>

              {/* Capture / Upload Action Buttons */}
              <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.82rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: '#166534',
                      borderColor: '#166534'
                    }}
                    onClick={handleStartCamera}
                  >
                    <Camera size={14} /> 📷 Capture Your Own Photo
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.82rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'white'
                    }}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    title="Upload image file from device"
                  >
                    <Upload size={14} /> Choose File
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />

                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {postForm.image
                    ? '✅ Custom photo attached! It will appear on your listing for buyers.'
                    : (autoImage
                      ? 'Showing default automatic image. Capturing a real photo is optional.'
                      : 'Automatic image will assign once you type produce name.')}
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                Produce Name *
              </label>

              {/* Optional Tamil Voice Input Button */}
              <button
                type="button"
                className={`btn ${isListening ? 'btn-danger' : 'btn-outline'}`}
                style={{
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.78rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  borderRadius: '20px',
                  backgroundColor: isListening ? '#dc2626' : '#f0fdf4',
                  borderColor: isListening ? '#dc2626' : '#86efac',
                  color: isListening ? '#ffffff' : '#166534',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  boxShadow: isListening ? '0 0 0 3px rgba(220, 38, 38, 0.25)' : 'none'
                }}
                onClick={isListening ? handleStopTamilVoice : handleStartTamilVoice}
                title="Click to speak crop name and quantity in Tamil (e.g. 'Enakku 100 kilo thakkali irukku')"
              >
                {isListening ? (
                  <>
                    <MicOff size={13} />
                    <span>🔴 Listening... (பேசுங்கள்)</span>
                  </>
                ) : (
                  <>
                    <Mic size={13} color="#16a34a" />
                    <span>🎙 Speak in Tamil (optional)</span>
                  </>
                )}
              </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
              You can also speak crop name &amp; quantity. <span style={{ color: '#16a34a', fontStyle: 'italic' }}>(e.g. "Enakku 100 kilo thakkali irukku" or "தக்காளி 100 கிலோ")</span>
            </div>

            {/* Recognized Speech Feedback Banner */}
            {voiceTranscript && (
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                marginBottom: '0.75rem',
                fontSize: '0.8rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#065f46'
              }}>
                <div>
                  <strong>🎙 Recognized Speech:</strong> "{voiceTranscript}"
                  <div style={{ fontSize: '0.72rem', color: '#047857', marginTop: '0.15rem' }}>
                    Auto-filled produce &amp; quantity. You can review or edit below before publishing.
                  </div>
                </div>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, padding: '0 4px' }}
                  onClick={() => setVoiceTranscript('')}
                  title="Dismiss voice banner"
                >
                  ✕
                </button>
              </div>
            )}

            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Paddy, Organic Country Tomatoes, Red Onions"
              value={postForm.productName}
              onChange={(e) => setPostForm({ ...postForm, productName: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Available Quantity *</label>
              <input
                type="number"
                step="any"
                required
                className="form-input"
                placeholder="e.g. 100"
                value={postForm.quantity}
                onChange={(e) => setPostForm({ ...postForm, quantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit *</label>
              <select
                className="form-select"
                value={postForm.unit}
                onChange={(e) => setPostForm({ ...postForm, unit: e.target.value })}
              >
                <option value="kg">kg (Kilograms)</option>
                <option value="tonnes">tonnes (Tonnes)</option>
                <option value="quintals">quintals (Quintals)</option>
                <option value="bunches">bunches (Bunches)</option>
                <option value="crates">crates (Crates)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Farm Location *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Madurai, Tamil Nadu"
              value={postForm.location}
              onChange={(e) => setPostForm({ ...postForm, location: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description &amp; Freshness Details</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="e.g. Fresh harvested paddy from organic field, ready for immediate dispatch."
              value={postForm.description}
              onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Harvest Date (Optional)</label>
              <input
                type="date"
                className="form-input"
                value={postForm.harvestDate}
                onChange={(e) => setPostForm({ ...postForm, harvestDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Delivery Note (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Farm pickup / Road freight"
                value={postForm.deliveryInfo}
                onChange={(e) => setPostForm({ ...postForm, deliveryInfo: e.target.value })}
              />
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
            💡 <strong>Direct Marketplace Rule:</strong> Farmers never set fixed prices; buyers compete with private bids to offer you the best value.
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Publish Listing
          </button>
        </form>
      </Modal>

      {/* MODAL: Submit Private Bid (Buyer) */}
      <Modal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        title={`Submit Private Bid for ${selectedPost?.productName || ''}`}
      >
        <form onSubmit={handleSubmitBid}>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Shield size={16} /> Complete Bid Confidentiality
            </p>
            <p style={{ fontSize: '0.78rem', color: '#15803d', marginTop: '0.2rem' }}>
              Your bid is visible <strong>ONLY</strong> to the farmer. Competing buyers cannot see your price or identity.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Offered Price per {selectedPost?.unit} (₹) *</label>
            <input
              type="number"
              step="any"
              required
              className="form-input"
              placeholder="e.g. 30"
              value={bidForm.offeredPrice}
              onChange={(e) => setBidForm({ ...bidForm, offeredPrice: e.target.value })}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Required Quantity ({selectedPost?.unit}) *</label>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534' }}>
                Available: {selectedPost?.availableQuantity !== undefined ? selectedPost.availableQuantity : selectedPost?.quantity} {selectedPost?.unit}
              </span>
            </div>
            <input
              type="number"
              step="any"
              min="0.01"
              max={selectedPost?.availableQuantity !== undefined ? selectedPost.availableQuantity : selectedPost?.quantity}
              required
              className="form-input"
              placeholder={`Max available: ${selectedPost?.availableQuantity !== undefined ? selectedPost.availableQuantity : selectedPost?.quantity}`}
              value={bidForm.quantity}
              onChange={(e) => setBidForm({ ...bidForm, quantity: e.target.value })}
            />
            {parseFloat(bidForm.quantity) > parseFloat(selectedPost?.availableQuantity !== undefined ? selectedPost.availableQuantity : selectedPost?.quantity) && (
              <div style={{
                color: '#b91c1c',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                marginTop: '0.4rem'
              }}>
                Only {selectedPost?.availableQuantity !== undefined ? selectedPost.availableQuantity : selectedPost?.quantity} {selectedPost?.unit} remaining.
              </div>
            )}
          </div>

          {bidForm.offeredPrice && bidForm.quantity && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '0.85rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ color: '#64748b' }}>Bid Subtotal:</span>
                <span style={{ fontWeight: 700, color: '#1b5e20' }}>
                  ₹{(+bidForm.offeredPrice * +bidForm.quantity).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                <span>Delivery Charge (flat):</span>
                <span>₹100</span>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '0.4rem', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                <span>Estimated Total:</span>
                <span style={{ color: '#1b5e20' }}>
                  ₹{(+bidForm.offeredPrice * +bidForm.quantity + 100).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Message / Delivery Terms (Optional)</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="e.g. Can arrange immediate pickup or pay transport."
              value={bidForm.message}
              onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>
            Confirm &amp; Submit Private Bid
          </button>
        </form>
      </Modal>

      {/* MODAL: View Private Bids (Farmer) */}
      <Modal
        isOpen={isOffersModalOpen}
        onClose={() => setIsOffersModalOpen(false)}
        title={`Bids & Sales Summary: ${selectedPost?.productName || ''}`}
      >
        {/* FARMER ORDER SUMMARY CARD */}
        {selectedPost && (() => {
          const totalQty = parseFloat(selectedPost.totalQuantity ?? selectedPost.quantity ?? 0);
          const acceptedOffers = offersList.filter(o => o.status === 'Accepted');
          const soldQty = acceptedOffers.reduce((sum, o) => sum + parseFloat(o.quantity), 0);
          const remainingQty = Math.max(0, totalQty - soldQty);
          const isSoldOut = remainingQty <= 0.001;

          return (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>
                  📊 Product: {selectedPost.productName}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  backgroundColor: isSoldOut ? '#dc2626' : '#166534',
                  color: 'white'
                }}>
                  {isSoldOut ? 'SOLD OUT' : 'ACTIVE'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <div style={{ background: 'white', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Total Quantity</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>
                    {totalQty} {selectedPost.unit}
                  </div>
                </div>

                <div style={{ background: 'white', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Sold / Purchased</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0284c7' }}>
                    {soldQty} {selectedPost.unit}
                  </div>
                </div>

                <div style={{ background: 'white', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Remaining</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isSoldOut ? '#dc2626' : '#166534' }}>
                    {remainingQty} {selectedPost.unit}
                  </div>
                </div>
              </div>

              {/* Buyers Breakdown */}
              <div style={{ background: 'white', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#475569', marginBottom: '0.4rem' }}>
                  Buyers:
                </div>
                {acceptedOffers.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    No partial purchases accepted yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {acceptedOffers.map((acc, idx) => (
                      <div key={idx} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#1f2937', fontWeight: 600 }}>👤 {acc.buyerName}</span>
                        <span style={{ color: '#166534', fontWeight: 700 }}>→ {acc.quantity} {selectedPost.unit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        <h4 style={{ margin: '0.5rem 0 0.75rem 0', fontSize: '0.95rem', color: '#334155', fontWeight: 700 }}>
          Incoming Confidential Bids
        </h4>

        {offersList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            No buyer bids submitted for this listing yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {offersList.map((offer) => (
              <div
                key={offer.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: offer.status === 'Accepted' ? '#f0fdf4' : 'white'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1f2937' }}>
                    🧑‍💼 {offer.buyerName}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#15803d', fontWeight: 700, marginTop: '0.2rem' }}>
                    Offer: ₹{offer.offeredPrice} / {selectedPost?.unit} &bull; Total: ₹{(offer.offeredPrice * offer.quantity).toLocaleString('en-IN')} ({offer.quantity} {selectedPost?.unit})
                  </div>
                  {offer.message && (
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      "{offer.message}"
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                    Status: <strong style={{ color: offer.status === 'Accepted' ? '#16a34a' : 'inherit' }}>{offer.status}</strong>
                  </div>
                </div>

                {offer.status === 'Pending' && (
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                    onClick={() => handleAcceptOffer(offer.id)}
                  >
                    <CheckCircle2 size={16} />
                    Accept Bid
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* CAMERA OVERLAY MODAL */}
      {isCameraOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: '16px',
            overflow: 'hidden',
            maxWidth: '520px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            border: '1px solid #334155'
          }}>
            {/* Header */}
            <div style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
                <Camera size={18} color="#22c55e" />
                <span>{capturedTempPhoto ? 'Preview Captured Photo' : 'Capture Harvest Photo'}</span>
              </div>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
                onClick={handleCancelCamera}
              >
                <X size={20} />
              </button>
            </div>

            {/* Viewfinder or Snapped Preview */}
            <div style={{ position: 'relative', width: '100%', minHeight: '300px', maxHeight: '55vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {capturedTempPhoto ? (
                <img
                  src={capturedTempPhoto}
                  alt="Captured Produce Preview"
                  style={{ width: '100%', maxHeight: '55vh', objectFit: 'contain' }}
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', maxHeight: '55vh', objectFit: 'cover' }}
                />
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {/* Action Buttons */}
            <div style={{ padding: '1rem 1.25rem', background: '#0f172a', display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {capturedTempPhoto ? (
                <>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ background: '#334155', color: 'white', borderColor: '#475569', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    onClick={handleRetakePhoto}
                  >
                    <RefreshCw size={15} /> Retake
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ background: '#16a34a', borderColor: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem', fontWeight: 700 }}
                    onClick={handleUseCapturedPhoto}
                  >
                    <CheckCircle2 size={16} /> Use Photo
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ background: '#334155', color: 'white', borderColor: '#475569' }}
                    onClick={handleCancelCamera}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ background: '#16a34a', borderColor: '#16a34a', padding: '0.6rem 1.5rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    onClick={handleSnapPhoto}
                  >
                    <Camera size={16} /> Snap Photo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
